import { createStandaloneToast } from "@chakra-ui/toast";
import { nanoid } from "nanoid";
import Observer from "patterns/observer";
// import TokenBucketRateLimit from "patterns/token-bucket-rate-limit";
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

// const TBRL_KEY_CONTENT_BG_SELF = "TBRL_KEY/CONTENT_BG_SELF";
// const TBRL_KEY_BG_CONTENT_SELF = "TBRL_KEY/BG_CONTENT_SELF";
// const TBRL_KEY_CONTENT_BG_OTHER = "TBRL_KEY/CONTENT_BG_OTHER";
// const TBRL_KEY_BG_BG_OTHER = "TBRL_KEY/BG_BG_OTHER";

class ExtensionManager extends Observer<{ id: ExtensionID }> {
  private static instance: ExtensionManager | null = null;

  private rateLimitMessageQueue: Array<Message> = [];

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
      const { source } = message as { source: ExtSourceOrTarget };

      if (typeof source === "object" && source.type === "ext-bg") {
        let temp = message.source;
        message.source = message.target;
        message.target = temp;

        message.meta.fireAndForget = true;

        ExtensionManager.process(message);
      }
    });
  }

  static hasExtension =
    ExtensionInfoManager.getInstance().hasExtensionInfo.bind(
      ExtensionInfoManager.getInstance()
    );

  static getExtensionInfo =
    ExtensionInfoManager.getInstance().getExtensionInfo.bind(
      ExtensionInfoManager.getInstance()
    );

  static process(data: Message) {
    const { target } = data as { target: ExtSourceOrTarget };
    if (target.type === "ext-bg") {
      // Dispatch msg to bg script
      const extensionWorkerManager = ExtensionWorkerManager.getInstance();
      return extensionWorkerManager.postMessageToWorker(data);
    } else {
      // Dispatch msg to content script
      const { value } = target;

      const customEvent = new CustomEvent(value, {
        detail: data,
      });

      window.dispatchEvent(customEvent);
    }
  }

  static async fetchExtension(
    extensionID: ExtensionID,
    extensionDisplayName: string,
    contentURL: string,
    backgroundURL: string,
    type: "default" | "silent" = "default"
  ) {
    // Load extension script
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = contentURL;

    scriptElement.setAttribute(`param-background`, backgroundURL);

    document.body.appendChild(scriptElement);

    const toastID = nanoid();
    if (type === "default") {
      toast({
        id: toastID,
        title: `Installing '${extensionDisplayName}' extension ...`,
        status: "info",
        isClosable: true,
      });
    }

    const customEventType = CUSTOM_EVENT_TYPES["install-extension"];

    return new Promise<void>((resolve) => {
      const listener = (event: any) => {
        const { detail: resData } = event;
        const { payload: resPayload } = resData;
        const { id: resMessageID } = resPayload;

        if (resMessageID === extensionID) {
          window.removeEventListener(customEventType, listener);
          if (type === "default") {
            toast.close(toastID);
            toast({
              title: `'${extensionDisplayName}' extension is installed!`,
              status: "success",
              isClosable: true,
            });
          }
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

        const doesTargetExtensionExist = ExtensionManager.hasExtension(
          target.value
        );
        if (!doesTargetExtensionExist) {
          const res = await fetch(
            createAPIPath(
              `/extensions?` + new URLSearchParams([["id", target.value]])
            )
          );
          const { contentURL, backgroundURL, displayName } = await res.json();
          // Install the other extension if it doesn't exist
          await ExtensionManager.fetchExtension(
            target.value,
            displayName,
            contentURL,
            backgroundURL
          );
        }

        // Checking for permission
        const sourceExtensionInfo = ExtensionManager.getExtensionInfo(
          source.value
        );
        const targetExtensionInfo = ExtensionManager.getExtensionInfo(
          target.value
        );

        if (!sourceExtensionInfo)
          throw new Error(
            `Non-existed source extension with id ${source.value}`
          );

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
      // CHECK PERMISSION

      // Since this scenario only happens with communication within one extension
      // it's passed by default

      // RATE LIMIT
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
      // CHECK PERMISSION
      const { source, target } = data as {
        source: ExtSourceOrTarget;
        target: ExtSourceOrTarget;
      };

      if (source.value !== target.value) {
        // The message is dispatched to another extension

        const doesTargetExtensionExist = ExtensionManager.hasExtension(
          target.value
        );
        if (!doesTargetExtensionExist) {
          const res = await fetch(
            createAPIPath(
              `/extensions?` + new URLSearchParams([["id", target.value]])
            )
          );
          const { contentURL, backgroundURL, displayName } = await res.json();
          // Install the other extension if it doesn't exist
          await ExtensionManager.fetchExtension(
            target.value,
            displayName,
            contentURL,
            backgroundURL
          );
        }

        // Checking for permission
        const sourceExtensionInfo = ExtensionManager.getExtensionInfo(
          source.value
        );
        const targetExtensionInfo = ExtensionManager.getExtensionInfo(
          target.value
        );

        if (!sourceExtensionInfo)
          throw new Error(
            `Non-existed source extension with id ${source.value}`
          );

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

  enqueueAllRateLimitMessages() {
    this.rateLimitMessageQueue.forEach((message) => {
      ExtensionManager.enqueueMessage(message);
    });

    this.rateLimitMessageQueue = [];
  }

  static enqueueMessage(data: Message) {
    const messageManager = MessageManager.getInstance();
    data.meta.handlerKey = EXT_MANAGER_MSG_HANDLER_KEY;
    messageManager.enqueueMessage(data);
  }

  updateExtensionInfo(extensionID: ExtensionID, data: Partial<ExtensionInfo>) {
    const extensionInfoManager = ExtensionInfoManager.getInstance();
    extensionInfoManager.updateExtensionInfo(extensionID, data);

    this.notify({ id: extensionID });
  }

  static terminateExtensionWorker =
    ExtensionWorkerManager.getInstance().terminateExtensionWorker.bind(
      ExtensionWorkerManager.getInstance()
    );
}

export default ExtensionManager;
