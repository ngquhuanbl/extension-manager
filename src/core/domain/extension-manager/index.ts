import { createStandaloneToast } from "@chakra-ui/toast";
import Observer from "patterns/observer";
import { createAPIPath } from "UI/utils/api";
import MessageManager, { EXT_MSG_EVENT_TYPE } from "../message-manager";
import SDK from "../sdk";
import ExtensionInfoManager, { ExtensionInfo } from "./extension-info-manager";
import ExtensionWorkerManager, {
  EXT_MANAGER_MSG_HANDLER_KEY,
} from "./extension-worker-manager";

const toast = createStandaloneToast();


const CUSTOM_EVENT_TYPES: Record<string, string> = {
  "install-extension": "EXTENSION_MANAGER/INSTALL_EXTENSION",
};

class ExtensionManager extends Observer<{ id: ExtensionID }> {
  private static instance: ExtensionManager | null = null;

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ExtensionManager();
    }
    return this.instance;
  }

  constructor() {
    super();

    // Register message handler
    const messageManager = MessageManager.getInstance();
    messageManager.registerMessageHandler(
      EXT_MANAGER_MSG_HANDLER_KEY,
      ExtensionManager.process
    );

    // Forward handling result from messange manager to worker
    window.addEventListener(EXT_MSG_EVENT_TYPE, (event: any) => {
      const { detail } = event;
      const message: Message = detail;
      const { source } = message as { source : ExtSourceOrTarget };

      if (typeof source === "object" && source.type === "ext-bg") {
        let temp = message.source;
        message.source = message.target;
        message.target = temp;

        message.meta.fireAndForget = true;

        ExtensionManager.process(message);
      }
    });
  }

  static hasExtension = ExtensionInfoManager.getInstance().hasExtensionInfo.bind(
    ExtensionInfoManager.getInstance()
  );

  static getExtensionInfo = ExtensionInfoManager.getInstance().getExtensionInfo.bind(
    ExtensionInfoManager.getInstance()
  );

  static process(data: Message) {
    const { target } = data as { target: ExtSourceOrTarget };
    if (target.type === 'ext-bg') {
      // Dispatch msg to bg script
      const extensionWorkerManager = ExtensionWorkerManager.getInstance();
      return extensionWorkerManager.postMessageToWorker(data);
    } else {
      // Dispatch msg to content script
      const { value } = target;

      const customEvent = new CustomEvent(value, {
        detail: data
      })

      window.dispatchEvent(customEvent);
    }
  }

  static async fetchExtension(extensionID: ExtensionID) {
    const res = await fetch(
      createAPIPath(`/extensions?` + new URLSearchParams([["id", extensionID]]))
    );
    const { content, background } = await res.json();

    // Load extension script
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = content;

    scriptElement.setAttribute(`param-background`, background);

    document.body.appendChild(scriptElement);

    const customEventType = CUSTOM_EVENT_TYPES["install-extension"];

    return new Promise<void>((resolve) => {
      const listener = (event: any) => {
        const { detail: resData } = event;
        const { payload: resPayload } = resData;
        const { id: resMessageID } = resPayload;

        if (resMessageID === extensionID) {
          window.removeEventListener(customEventType, listener);
          resolve();
        }
      };
      window.addEventListener(customEventType, listener);
    });
  }

  saveExtension(data: ExtensionInfo) {
    const { id } = data;

    const extensionInfoManager = ExtensionInfoManager.getInstance();
    extensionInfoManager.saveExtensionInfo(data);

    const extensionWorkerManager = ExtensionWorkerManager.getInstance();
    extensionWorkerManager.registerExtensionWorker(id);

    const installExtEventType = CUSTOM_EVENT_TYPES["install-extension"];
    const customEvent = new CustomEvent(installExtEventType, {
      detail: {
        payload: {
          id,
        },
      },
    });
    window.dispatchEvent(customEvent);

    this.notify({ id });
  }

  unsaveExtension(id: ExtensionID) {
    const extensionInfoManager = ExtensionInfoManager.getInstance();

    extensionInfoManager.removeExtensionInfo(id);

    const extensionWorkerManager = ExtensionWorkerManager.getInstance();
    extensionWorkerManager.removeExtensionWorker(id);

    this.notify({ id });
  }

  static onMessage(event: { data: Message }) {
    const { data } = event;

    const { target } = data;

    if (target === "sdk") {
      const sdk = SDK.getInstance();
      sdk.dispatchMsgFromExtBGToSDK(data);
    } else {
      const { target } = data as { target: ExtSourceOrTarget };
      const { type } = target;
      if (type === "ext-bg") {
        ExtensionManager.dispatchMsgFromExtBGToOtherExtBG(data);
      } else if (type === "ext-content") {
        ExtensionManager.dispatchMsgFromExtBGToExtContent(data);
      }
    }
  }

  static async dispatchMsgFromExtContentToExtBG(data: Message) {
    try {
      // TODO: CHECK PERMISSION + RATE LIMIT
      const { source, target } = data as {
        source: ExtSourceOrTarget;
        target: ExtSourceOrTarget;
      };

      if (source.value !== target.value) {
        // The message is dispatched to another extension

        const doesTargetExtensionExist = ExtensionManager.hasExtension(target.value);
        if (!doesTargetExtensionExist)
          // Install the other extension if it doesn't exist
          await ExtensionManager.fetchExtension(target.value);

        // Checking for permission
        const sourceExtensionInfo = ExtensionManager.getExtensionInfo(source.value);
        const targetExtensionInfo = ExtensionManager.getExtensionInfo(target.value);

        if (!sourceExtensionInfo)
          throw new Error(`Non-existed source extension with id ${source.value}`);

        const { permissions } = sourceExtensionInfo;

        if (!permissions?.includes(`sendMsg:${target.value}`))
          throw new Error(
            `'${sourceExtensionInfo.displayName}' extension is not allowed to send messages to '${targetExtensionInfo?.displayName}' extension`
          );
      }

      // IF PASS, ENQUEUE THE MESSAGE
      ExtensionManager.enqueueMessage(data);
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  static dispatchMsgFromExtBGToExtContent(data: Message) {
    try {
      // TODO: CHECK PERMISSION + RATE LIMIT

      // Since this scenario only happens with communication within one extension
      // it's passed by default

      // IF PASS, ENQUEUE THE MESSAGE
      ExtensionManager.enqueueMessage(data);
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  static async dispatchMsgFromExtBGToOtherExtBG(data: Message) {
    try {
      // TODO: CHECK PERMISSION + RATE LIMIT
      const { source, target } = data as {
        source: ExtSourceOrTarget;
        target: ExtSourceOrTarget;
      };

      if (source.value !== target.value) {
        // The message is dispatched to another extension

        const doesTargetExtensionExist = ExtensionManager.hasExtension(target.value);
        if (!doesTargetExtensionExist)
          // Install the other extension if it doesn't exist
          await ExtensionManager.fetchExtension(target.value);

        // Checking for permission
        const sourceExtensionInfo = ExtensionManager.getExtensionInfo(source.value);
        const targetExtensionInfo = ExtensionManager.getExtensionInfo(target.value);

        if (!sourceExtensionInfo)
          throw new Error(`Non-existed source extension with id ${source.value}`);

        const { permissions } = sourceExtensionInfo;

        if (!permissions?.includes(`sendMsg:${target.value}`))
          throw new Error(
            `'${sourceExtensionInfo.displayName}' extension is not allowed to send messages to '${targetExtensionInfo?.displayName}' extension`
          );
      }

      // IF PASS, ENQUEUE THE MESSAGE
      ExtensionManager.enqueueMessage(data);
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  static enqueueMessage(data: Message) {
    const messageManager = MessageManager.getInstance();
    data.meta.handlerKey = EXT_MANAGER_MSG_HANDLER_KEY;
    messageManager.enqueueMessage(data);
  }
}

export default ExtensionManager;
