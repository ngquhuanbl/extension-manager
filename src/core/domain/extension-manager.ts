import Observer, { Subscriber } from "patterns/observer";
import { createStandaloneToast } from "@chakra-ui/react";
import ActivationMap, { EventConditions } from "./activation-map";
import SDK from "./sdk";

const toast = createStandaloneToast();

const activationMap = ActivationMap.getInstance();

interface ExtensionComponent {
  position: UIPosition;
  type: ComponentType;
  id: ExtensionComponentID;
}

export class Extension {
  id: string;
  worker: Worker | null = null;

  constructor(
    public name: string,
    public publisher: string,
    public activationEvents: string[],
    public components: Array<ExtensionComponent>,
    public backgroundURL: string | null = null
  ) {
    // Construct data
    this.id = Extension.getExtensionID(this.name, this.publisher);
    this.name = name;
    this.publisher = publisher;
    this.activationEvents = activationEvents;
    this.components = components;
    this.backgroundURL = backgroundURL;

    // Set up activation events
    this.setUpActivationEvents();
  }

  setUpActivationEvents() {
    const registeredSubscribers: Array<Subscriber<EventConditions>> = [];
    this.activationEvents.forEach((eventName) => {
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

  static getExtensionID(name: string, publisher: string) {
    return publisher.concat("-").concat(name).replace(/ /g, "-");
  }

  startWorker() {
    if (!this.worker) {
      if (!this.backgroundURL) return;

      this.worker = new Worker("static/js/extension-worker.bundle.js");
      this.worker.addEventListener("message", this.onMessage.bind(this), false);

      const loadBackgroundScriptMessage: WorkerMessage = {
        type: "BG_REQUEST",
        context: "LOAD_BACKGROUND_SCRIPT",
        messageData: {
          endpoint: this.backgroundURL,
        },
      };
      this.worker.postMessage(loadBackgroundScriptMessage);

      const activateMessage: WorkerMessage = {
        type: "BG_REQUEST",
        context: "ACTIVATE",
      };
      this.worker.postMessage(activateMessage);
    }
  }

  terminateWorker() {
    if (this.worker) {
      const deactivateMessage: WorkerMessage = {
        type: "BG_REQUEST",
        context: "DEACTIVATE",
      };
      this.worker.postMessage(deactivateMessage);
      this.worker?.terminate();
      this.worker = null;
    }
  }

  async onMessage(event: any) {
    const { data: workerMessage } = event;
    const { type, context, messageData, manifestData } =
      workerMessage as WorkerMessage;

    // FLOW 1: BACKGROUND <-> WORKER
    if (type === "SDK_REQUEST") {
      // Forward to Extension API Handlers to process
      const sdkMessage = {
        context,
        messageData,
        manifestData,
      };
      try {
        const res = await SDK.getInstance().process(sdkMessage);

        const sdkResponseMessage: WorkerMessage = {
          type: "SDK_RESPONSE",
          context,
          messageData: res,
        };
        this.worker!.postMessage(sdkResponseMessage);
      } catch (e: any) {
        const { message } = e;
        toast({
          title: message,
          status: "error",
          isClosable: true,
        });
      }
    }

    // FLOW 2: WORKER <-> SDK
    if (type === "BG_RESPONSE") {
      // Logic is already handled in postMessageToExtensionBG global function
    }
  }
}

class ExtensionManager extends Observer<{ id: ExtensionID }> {
  private static instance: ExtensionManager | null = null;

  private extensions: Map<ExtensionID, Extension> = new Map();

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ExtensionManager();
    }
    return this.instance;
  }

  hasExtension(id: ExtensionID) {
    return this.extensions.has(id);
  }

  addExtension(id: ExtensionID, extension: Extension) {
    if (this.hasExtension(id)) return;

    this.extensions.set(id, extension);

    this.notify({
      id,
    });
  }

  removeExtension(id: ExtensionID) {
    if (!this.hasExtension(id)) return;

    const extension = this.extensions.get(id)!;

    extension.terminateWorker();

    extension.removeActivationEvents();

    this.extensions.delete(id);

    this.notify({ id });
  }

  getExtension(id: ExtensionID) {
    if (!this.hasExtension(id)) return null;

    return this.extensions.get(id)!;
  }
}

export default ExtensionManager;
