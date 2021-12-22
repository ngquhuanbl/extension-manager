import { createStandaloneToast } from "@chakra-ui/toast";
import { nanoid } from "nanoid";
import ObserverWithConditions from "patterns/observer";
import TokenBucketRateLimit, { BucketOptions } from "patterns/token-bucket-rate-limit";
// import TokenBucketRateLimit from "patterns/token-bucket-rate-limit";
import { createAPIPath } from "UI/utils/api";
import MessageManager, { CUSTOM_EVENT_TYPE_EXT_AWAIT_MSG } from "../message-manager";
import SDK from "../sdk";
import ExtensionInfoManager from "./extension-info-manager";
import ExtensionWorkerManager, {
  EXT_MANAGER_MSG_HANDLER_KEY,
} from "./extension-worker-manager";

const toast = createStandaloneToast();

const CUSTOM_EVENT_TYPES: Record<string, string> = {
  "install-extension": "EXTENSION_MANAGER/INSTALL_EXTENSION",
};

const TBRL_KEY_CONTENT_BG = "TBRL_KEY/CONTENT_BG";
const TBRL_KEY_BG_CONTENT = "TBRL_KEY/BG_CONTENT";
const TBRL_KEY_BG_BG = "TBRL_KEY/BG_BG";

class ExtensionManager extends ObserverWithConditions<{ id: ExtensionID }> {
  private static instance: ExtensionManager | null = null;

  private rateLimitMessageQueue: Map<string, Array<Message>> = new Map();

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
    window.addEventListener(CUSTOM_EVENT_TYPE_EXT_AWAIT_MSG, async (event: any) => {
      const { detail } = event;
      const message: Message = detail;
      const { source } = message as { source: ExtSourceOrTarget };

      if (typeof source === "object" && source.type === "ext-bg") {
        let temp = message.source;
        message.source = message.target;
        message.target = temp;

        message.meta.fireAndForget = true;

        await ExtensionManager.process(message);
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

      return Promise.resolve();
    }
  }

  static async fetchExtension(
    extensionID: ExtensionID,
    extensionDisplayName: string,
    contentURL: string,
    backgroundURL: string,
    type: "default" | "silent" = "default",
    initialExtensionStatus: ExtensionStatus = 'ENABLED'
  ) {
    // Load extension script
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = contentURL;
    scriptElement.onerror = function() {
      toast({
        title: 'Failed to fetch extension data',
        status: "error",
        isClosable: true,
      })
    }

    scriptElement.setAttribute(`param-background`, backgroundURL);
    scriptElement.setAttribute(`param-init-ext-status`, initialExtensionStatus);

    document.body.appendChild(scriptElement);

    const toastID = nanoid();
    if (type === "default") {
      toast({
        id: toastID,
        title: `Installing '${extensionDisplayName}' extension ...`,
        status: "info",
        isClosable: true,
        duration: 2000
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
              duration: 2000
            });
          }
          resolve();
        }
      };
      window.addEventListener(customEventType, listener);
    });
  }

  async saveExtension(data: ExtensionInfo) {
    const { id } = data;

    const extensionInfoManager = ExtensionInfoManager.getInstance();
    extensionInfoManager.saveExtensionInfo(data);

    const extensionWorkerManager = ExtensionWorkerManager.getInstance();
    await extensionWorkerManager.registerExtensionWorker(id);

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

  async unsaveExtension(id: ExtensionID) {
    const extensionWorkerManager = ExtensionWorkerManager.getInstance();
    await extensionWorkerManager.removeExtensionWorker(id);

    const extensionInfoManager = ExtensionInfoManager.getInstance();
    extensionInfoManager.removeExtensionInfo(id);

    this.notify({ id });
  }

  static onMessage(event: { data: Message }) {

    const { data } = event;

    const { target, type } = data;

    if (type.includes('RESPONSE')) return; // No handle RESPONSE message

    if (target === "sdk") {
      const sdk = SDK.getInstance();
      sdk.dispatchMsgFromExtBGToSDK(data);
    } else {
      const { target } = data as { target: ExtSourceOrTarget };
      const { type } = target;
      const extensionManager = ExtensionManager.getInstance();
      if (type === "ext-bg") {
        extensionManager.dispatchMsgFromExtBGToOtherExtBG(data);
      } else if (type === "ext-content") {
        extensionManager.dispatchMsgFromExtBGToExtContent(data);
      }
    }
  }

  async dispatchMsgFromExtContentToExtBG(data: Message) {
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
            `Non-existed source extension with id ${source.value || source}`
          );

        const { permissions } = sourceExtensionInfo;

        if (!permissions?.includes(`sendMsg:${target.value}`))
          throw new Error(
            `'${sourceExtensionInfo.displayName}' extension is not allowed to send messages to '${targetExtensionInfo?.displayName}' extension`
          );
      }

      // RATE LIMIT
      this.rateLimitMessage(data, TBRL_KEY_CONTENT_BG, { interval: 1000, bucketCapacity: 3 })
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  dispatchMsgFromSDKToExtBG(data: Message) {
    try {
      // CHECK PERMISSION (ALWAYS SKIPPED)

      // RATE LIMIT (ALWAYS SKIPPED)
      // this.rateLimitMessage(data, TBRL_KEY_CONTENT_BG, { interval: 1000, bucketCapacity: 3 })
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

  dispatchMsgFromExtBGToExtContent(data: Message) {
    try {
      // CHECK PERMISSION

      // Since this scenario only happens with communication within one extension
      // it's passed by default

      // RATE LIMIT
      this.rateLimitMessage(data, TBRL_KEY_BG_CONTENT, { interval: 1000, bucketCapacity: 3 })
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  async dispatchMsgFromExtBGToOtherExtBG(data: Message) {
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
            `Non-existed source extension with id ${source.value || source}`
          );

        const { permissions } = sourceExtensionInfo;

        if (!permissions?.includes(`sendMsg:${target.value}`))
          throw new Error(
            `'${sourceExtensionInfo.displayName}' extension is not allowed to send messages to '${targetExtensionInfo?.displayName}' extension`
          );
      }

      // RATE LIMIT
      this.rateLimitMessage(data, TBRL_KEY_BG_BG, { interval: 1000, bucketCapacity: 3 })
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
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

  rateLimitMessage(data: Message, bucketKeyType: string, options: BucketOptions) {
    const { source, target } = data as {
      source: ExtSourceOrTarget;
      target: ExtSourceOrTarget;
    };
    const bucketKey = `${bucketKeyType}_${source.value}_${target.value}`;
    const successTokenCallback = () => {
      ExtensionManager.enqueueMessage(data);
    }
    const preRenewTokenCalback = () => {
      this.enqueueNewRateLimitMessage(bucketKey, data);
    }
    const postRenewTokenCallback = () => {
      this.enqueueAllRateLimitMessagesForExecution(bucketKey);
    }
    const tokenBucketRateLimit = TokenBucketRateLimit.getInstance();
    tokenBucketRateLimit.takeToken(bucketKey, options, successTokenCallback, preRenewTokenCalback, postRenewTokenCallback);
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
