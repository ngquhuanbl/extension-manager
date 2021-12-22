import { createStandaloneToast } from "@chakra-ui/toast";
import InterceptorManager, { Interceptor } from "patterns/intercepting-filter";
import TokenBucketRateLimit, {
  BucketOptions,
} from "patterns/token-bucket-rate-limit";
import ExtensionManager from "../extension-manager";
import MessageManager from "../message-manager";
import FriendlistManager, { FriendlistLoader } from "./friendlist-manager";
import { DialogPermissionInterceptor } from "./interceptors";

const toast = createStandaloneToast();

const TBRL_KEY_SDK = "TBRL_KEY/SDK";
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
  "sdk.registerFriendlistLoader": (message: Message) => {
    const { payload, source } = message;
    const { loaderID } = payload;

    const loader: FriendlistLoader = async () => {
      const message: Message = {
        type: "GET_FRIENDLIST",
        source: "sdk",
        target: source,
        payload,
        meta: {
          fireAndForget: false,
        },
      };
      const res = await (window as any).dispatchMsgFromSDK(message);
      return res;
    };


    const friendlistManager = FriendlistManager.getInstance();
    friendlistManager.registerFriendlist(loaderID, loader);
  },
  "sdk.removeFriendlistLoader": (message: Message) => {
    const { payload } = message;
    const { loaderID } = payload;

    const friendlistManager = FriendlistManager.getInstance();
    friendlistManager.removeFriendlist(loaderID);
  },
};

const INTERCEPTORS: Record<string, Interceptor> = {
  dialog: new DialogPermissionInterceptor(),
};

class SDK {
  private static instance: SDK | null = null;

  private rateLimitMessageQueue = new Map<ExtensionID, Array<Message>>();

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

    const handler = HANDLERS[type] || function() {};

    return handler(data);
  }

  dispatchMsgFromExtContentToSDK(data: Message) {
    try {
      // CHECK PERMISSION + RATE LIMIT
      const { source, type } = data;
      const extensionInfo = ExtensionManager.getExtensionInfo(
        (source as ExtSourceOrTarget).value
      );

      if (!extensionInfo)
        throw new Error(`Non-existed extension with id ${source}`);

      const { permissions } = extensionInfo;

      const interceptedTarget = (data: Message) => {
        // IF PASS, RATE LIMIT THE MESSAGE
        this.rateLimitMessage(data, {
          interval: 1000,
          bucketCapacity: 3,
        });
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
      // CHECK PERMISSION + RATE LIMIT
      const { source, type } = data;
      const extensionInfo = ExtensionManager.getExtensionInfo(
        (source as ExtSourceOrTarget).value
      );

      if (!extensionInfo)
        throw new Error(`Non-existed extension with id ${source}`);

      const { permissions } = extensionInfo;

      const interceptedTarget = (data: Message) => {
        // IF PASS, RATE LIMIT THE MESSAGE
        this.rateLimitMessage(data, {
          interval: 1000,
          bucketCapacity: 3,
        });
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

  rateLimitMessage(data: Message, options: BucketOptions) {
    const { source } = data as {
      source: ExtSourceOrTarget;
    };
    const bucketKey = `${TBRL_KEY_SDK}_${source.value}`;
    const successTokenCallback = () => {
      SDK.enqueueMessage(data);
    };
    const preRenewTokenCalback = () => {
      this.enqueueNewRateLimitMessage(bucketKey, data);
    };
    const postRenewTokenCallback = () => {
      this.enqueueAllRateLimitMessagesForExecution(bucketKey);
    };
    const tokenBucketRateLimit = TokenBucketRateLimit.getInstance();
    tokenBucketRateLimit.takeToken(
      bucketKey,
      options,
      successTokenCallback,
      preRenewTokenCalback,
      postRenewTokenCallback
    );
  }

  static enqueueMessage(data: Message) {
    const messageManager = MessageManager.getInstance();
    data.meta.handlerKey = SDK_MSG_HANDLER_KEY;
    messageManager.enqueueMessage(data);
  }

  enqueueNewRateLimitMessage(key: string, data: Message) {
    const rateLimitMessages = this.rateLimitMessageQueue.get(key) || [];

    rateLimitMessages.push(data);

    this.rateLimitMessageQueue.set(key, rateLimitMessages);
  }

  enqueueAllRateLimitMessagesForExecution(key: string) {
    const rateLimitMessage = this.rateLimitMessageQueue.get(key);

    if (rateLimitMessage) {
      rateLimitMessage.forEach((message) => {
        ExtensionManager.enqueueMessage(message);
      });

      this.rateLimitMessageQueue.set(key, []);
    }
  }

  getInterceptors(messageType: string) {
    let permissions = messageType.split(".");

    return permissions
      .map((permission) => INTERCEPTORS[permission])
      .filter((interceptor) => interceptor !== undefined);
  }
}

export default SDK;
