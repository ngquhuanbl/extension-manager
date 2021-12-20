import { createStandaloneToast } from "@chakra-ui/toast";
import { Subscriber } from "patterns/observer";
import ExtensionManager from "..";
import ActivationMap, { EventConditions } from "../../activation-map";
import ExtensionInfoManager from "../extension-info-manager";

const toast = createStandaloneToast();

export const EXT_MANAGER_MSG_HANDLER_KEY = "MSG_HANDLER/EXT_MANAGER";

export class ExtensionWorker {
  private workerInstance: Worker | null = null;

  constructor(public id: ExtensionID) {
    this.id = id;

    // Set up activation events
    this.setUpActivationEvents();
  }

  setUpActivationEvents() {
    try {
      const extensionInfoManager = ExtensionInfoManager.getInstance();

      const extensionInfo = extensionInfoManager.getExtensionInfo(this.id);

      if (!extensionInfo) throw Error("No extension info found!");

      const { activationEvents } = extensionInfo;
      const activationMap = ActivationMap.getInstance();

      const registeredSubscribers: Array<Subscriber<EventConditions>> = [];
      activationEvents.forEach((eventName) => {
        registeredSubscribers.push(
          activationMap.subscribeToActivationEvent(
            eventName,
            this.start.bind(this)
          ),
          activationMap.subscribeToDeactivationEvent(
            eventName,
            this.terminate.bind(this)
          )
        );
      });

      this.removeActivationEvents = function () {
        registeredSubscribers.forEach((subscriber) => {
          activationMap.unsubscribeToEvent(subscriber);
        });
      };
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  removeActivationEvents() {}

  isActive() {
    return this.workerInstance !== null;
  }

  start() {
    try {
      if (!this.workerInstance) {
        const extensionInfoManager = ExtensionInfoManager.getInstance();

        const extensionInfo = extensionInfoManager.getExtensionInfo(this.id);

        if (!extensionInfo) throw Error("No extension info found!");

        const { backgroundURL, status, displayName } = extensionInfo;

        if (status === "DISABLED")
          throw Error(
            `'${displayName}' extension is disabled! Request is cancelled!`
          );

        if (!backgroundURL) return;

        this.workerInstance = new Worker(
          "static/js/extension-worker.bundle.js"
        );

        this.workerInstance.addEventListener(
          "message",
          ExtensionManager.onMessage
        );

        const loadBackgroundScriptMessage: WorkerMessage = {
          type: "LOAD_BACKGROUND_SCRIPT",
          payload: {
            endpoint: backgroundURL,
          },
        };
        this.workerInstance.postMessage(loadBackgroundScriptMessage);

        const activateMessage: WorkerMessage = {
          type: "ACTIVATE",
        };
        this.workerInstance.postMessage(activateMessage);
      }
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }

  async terminate() {
    if (this.workerInstance) {
      const deactivateMessage: WorkerMessage = {
        type: "DEACTIVATE",
      };
      this.workerInstance.postMessage(deactivateMessage);

      // Wait until deactivate function finished
      await new Promise<void>((resolve) => {
        const listener = (event: any) => {
          if (event.data && event.data.type === 'FINISH_DEACTIVATE') {
            this.removeEventListener('message', listener);
            resolve();
          }
        }
        this.addEventListener('message', listener);
      })
      this.workerInstance.terminate();
      this.workerInstance = null;
    }
  }

  postMessage(data: any) {
    console.log('extension worker manager - postMessage', data);
    const { result, ...noResultData } = data;
    this.workerInstance?.postMessage(noResultData);
  }

  addEventListener(
    type: "message" | "messageerror",
    listener: (this: Worker, ev: MessageEvent<any>) => any,
    options?: boolean | AddEventListenerOptions | undefined
  ) {
    this.workerInstance?.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: "message" | "messageerror",
    listener: (this: Worker, ev: any) => any,
    options?: boolean | EventListenerOptions | undefined
  ) {
    this.workerInstance?.removeEventListener(type, listener, options);
  }
}

class ExtensionWorkerManager {
  private static instance: ExtensionWorkerManager | null = null;

  private extensionWorkerMap: Map<ExtensionID, ExtensionWorker> = new Map();

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ExtensionWorkerManager();
    }
    return this.instance;
  }

  hasExtensionWorker(id: ExtensionID) {
    return this.extensionWorkerMap.has(id);
  }

  registerExtensionWorker(id: ExtensionID) {
    if (this.hasExtensionWorker(id)) return;

    const extensionWorker = new ExtensionWorker(id);

    this.extensionWorkerMap.set(id, extensionWorker);
  }

  async terminateExtensionWorker(id: ExtensionID) {
    if (!this.hasExtensionWorker(id)) return;

    const extensionWorker = this.extensionWorkerMap.get(id)!;

    await extensionWorker.terminate();
  }

  async removeExtensionWorker(id: ExtensionID) {
    if (!this.hasExtensionWorker(id)) return;

    const extensionWorker = this.extensionWorkerMap.get(id)!;

    await extensionWorker.terminate();

    extensionWorker.removeActivationEvents();

    this.extensionWorkerMap.delete(id);
  }

  getExtensionWorker(id: ExtensionID) {
    return this.extensionWorkerMap.get(id) || null;
  }

  postMessageToWorker(data: Message) {
    try {
      const { target, meta } = data;
      const { messageID } = meta;

      let extensionID = (target as ExtSourceOrTarget).value;

      const extensionWorker = this.getExtensionWorker(extensionID);

      if (!extensionWorker)
        throw new Error(`Non-existed extension with id ${extensionID}`);

      if (!extensionWorker.isActive()) {
        extensionWorker.start();
        // throw new Error(
        //   `Non-active worker associated with extension whose id is ${extensionID}`
        // );
      }

      extensionWorker.postMessage(data);

      const { fireAndForget } = meta;

      if (!fireAndForget) {
        // If this message is required to return a result,
        // then we create a promise to achieve that
        return new Promise((resolve) => {
          const listener = (event: any) => {
            const { data: resData } = event;
            const { meta: resMeta, payload: resPayload } = resData;
            const { messageID: resMessageID } = resMeta;
            if (messageID === resMessageID) {
              extensionWorker.removeEventListener("message", listener);
              resolve(resPayload);
            }
          };
          extensionWorker.addEventListener("message", listener);
        });
      }
    } catch (e: any) {
      const { message } = e;
      toast({
        title: message,
        status: "error",
        isClosable: true,
      });
    }
  }
}

export default ExtensionWorkerManager;
