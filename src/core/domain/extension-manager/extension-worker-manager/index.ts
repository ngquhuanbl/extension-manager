import { Subscriber } from "patterns/observer";
import ExtensionManager from "..";
import ActivationMap, { EventConditions } from "../../activation-map";
import ExtensionInfoManager from "../extension-info-manager";

export const EXT_MANAGER_MSG_HANDLER_KEY = "MSG_HANDLER/EXT_MANAGER";

export class ExtensionWorker {
  worker: Worker | null = null;

  constructor(public id: ExtensionID) {
    this.id = id;

    // Set up activation events
    this.setUpActivationEvents();
  }

  setUpActivationEvents() {
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
          this.startWorker.bind(this)
        ),
        activationMap.subscribeToDeactivationEvent(
          eventName,
          this.terminateWorker.bind(this)
        )
      );
    });

    this.removeActivationEvents = function () {
      registeredSubscribers.forEach((subscriber) => {
        activationMap.unsubscribeToEvent(subscriber);
      });
    };
  }

  removeActivationEvents() {}

  startWorker() {
    if (!this.worker) {
      const extensionInfoManager = ExtensionInfoManager.getInstance();

      const extensionInfo = extensionInfoManager.getExtensionInfo(this.id);

      if (!extensionInfo) throw Error("No extension info found!");

      const { backgroundURL } = extensionInfo;

      if (!backgroundURL) return;

      this.worker = new Worker("static/js/extension-worker.bundle.js");


      this.worker.addEventListener("message", ExtensionManager.onMessage.bind(this));

      const loadBackgroundScriptMessage: WorkerMessage = {
        type: "LOAD_BACKGROUND_SCRIPT",
        payload: {
          endpoint: backgroundURL,
        },
      };
      this.worker.postMessage(loadBackgroundScriptMessage);

      const activateMessage: WorkerMessage = {
        type: "ACTIVATE",
      };
      this.worker.postMessage(activateMessage);
    }
  }

  terminateWorker() {
    if (this.worker) {
      const deactivateMessage: WorkerMessage = {
        type: "DEACTIVATE",
      };
      this.worker.postMessage(deactivateMessage);
      this.worker.terminate();
      this.worker = null;
    }
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

  removeExtensionWorker(id: ExtensionID) {
    if (!this.hasExtensionWorker(id)) return;

    const extension = this.extensionWorkerMap.get(id)!;

    extension.terminateWorker();

    extension.removeActivationEvents();

    this.extensionWorkerMap.delete(id);
  }

  getExtensionWorker(id: ExtensionID) {
    return this.extensionWorkerMap.get(id) || null;
  }

  postMessageToWorker(data: Message) {
    const { target, meta } = data;
    const { messageID } = meta;

    let extensionID = (target as ExtSourceOrTarget).value;

    const extension = this.getExtensionWorker(extensionID);

    if (!extension)
      throw new Error(`Non-existed extension with id ${extensionID}`);

    let { worker } = extension;

    if (!worker) {
      extension.startWorker();
      worker = extension.worker;
      // throw new Error(
      //   `Non-active worker associated with extension whose id is ${extensionID}`
      // );
    }
    worker!.postMessage(data);

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
            worker!.removeEventListener("message", listener);
            resolve(resPayload);
          }
        };
        worker!.addEventListener("message", listener);
      });
    }
  }
}

export default ExtensionWorkerManager;
