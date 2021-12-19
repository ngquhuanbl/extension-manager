import { createStandaloneToast } from "@chakra-ui/toast";
import InterceptorManager, { Interceptor } from "patterns/intercepting-filter";
import ExtensionManager from "../extension-manager";
import MessageManager from "../message-manager";
import { DialogPermissionInterceptor } from "./interceptors";

const toast = createStandaloneToast();

export const SDK_MSG_HANDLER_KEY = "MSG_HANDLER/SDK";

const HANDLERS: Record<string, GenericFunction> = {
  "sdk.dialog.showMessageBox": async (message: Message) => {
    const { payload } = message;

    const res = await window.dialog.showMessageBox(payload);
    return res;
  },
  "sdk.dialog.showOpenDialog": async (message: Message) => {
    const { payload } = message;

    const res = await window.dialog.showOpenDialog(payload);
    return res;
  },
  "sdk.dialog.showMessageBoxSync": (message: Message) => {
    const { payload } = message;
    return Promise.resolve(window.dialog.showMessageBoxSync(payload));
  },
};

const INTERCEPTORS: Record<string, Interceptor> = {
  dialog: new DialogPermissionInterceptor(),
};

class SDK {
  private static instance: SDK | null = null;

  private rateLimitQueue = new Map<ExtensionID, Array<Message>>();

  static getInstance() {
    if (this.instance === null) {
      this.instance = new SDK();
    }
    return this.instance;
  }

  constructor() {
    // Register message handler
    const messageManager = MessageManager.getInstance();
    messageManager.registerMessageHandler(
      SDK_MSG_HANDLER_KEY,
      this.process.bind(this)
    );
  }

  process(data: Message) {
    const { type } = data;

    const handler = HANDLERS[type];

    return handler(data);
  }

  dispatchMsgFromExtContentToSDK(data: Message) {
    try {
      // TODO: CHECK PERMISSION + RATE LIMIT
      const { source, type } = data;
      const extensionInfo = ExtensionManager.getExtensionInfo(
        (source as ExtSourceOrTarget).value
      );

      if (!extensionInfo)
        throw new Error(`Non-existed extension with id ${source}`);

      const { permissions } = extensionInfo;

      const interceptedTarget = (data: Message) => {
        // IF PASS, ENQUEUE THE MESSAGE
        const messageManager = MessageManager.getInstance();
        data.meta.handlerKey = SDK_MSG_HANDLER_KEY;
        messageManager.enqueueMessage(data);
      };

      const interceptors = this.getInterceptors(type);

      const processor = new InterceptorManager();

      interceptors.forEach((interceptor) => {
        processor.addInterceptor(interceptor);
      });

      const interceptedTargetArgs = {
        ...data,
        permissions,
      };

      processor.process(interceptedTarget, interceptedTargetArgs);
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  dispatchMsgFromExtBGToSDK(data: Message) {
    try {
      // TODO: CHECK PERMISSION + RATE LIMIT
      const { source, type } = data;
      const extensionInfo = ExtensionManager.getExtensionInfo(
        (source as ExtSourceOrTarget).value
      );

      if (!extensionInfo)
        throw new Error(`Non-existed extension with id ${source}`);

      const { permissions } = extensionInfo;

      const interceptedTarget = (data: Message) => {
        // IF PASS, ENQUEUE THE MESSAGE
        const messageManager = MessageManager.getInstance();
        data.meta.handlerKey = SDK_MSG_HANDLER_KEY;
        messageManager.enqueueMessage(data);
      };

      const interceptors = this.getInterceptors(type);

      const processor = new InterceptorManager();

      interceptors.forEach((interceptor) => {
        processor.addInterceptor(interceptor);
      });

      const interceptedTargetArgs = {
        ...data,
        permissions,
      };

      processor.process(interceptedTarget, interceptedTargetArgs);
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  getInterceptors(messageType: string) {
    let permissions = messageType.split(".");

    // Remove global object
    permissions = permissions.filter((permission) => permission !== "window");
    // Remove method name
    if (permissions.length > 1) permissions.pop();

    return permissions.map((permission) => INTERCEPTORS[permission]);
  }
}

export default SDK;
