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
    public backgroundURL: string
  ) {
    this.id = Extension.createExtensionID(this.name, this.publisher);
    this.name = name;
    this.publisher = publisher;
    this.activationEvents = activationEvents;
    this.components = components;
    this.backgroundURL = backgroundURL;

    // Check activation events to start worker
    if (this.activationEvents.includes("*")) this.startWorker();
  }

  static createExtensionID(name: string, publisher: string) {
    return publisher.concat("-").concat(name).replace(/ /g, "-");
  }

  startWorker() {
    if (!this.worker) {
      this.worker = new Worker("/static/js/extension-worker.bundle.js");

      this.worker.addEventListener("message", this.onMessage.bind(this), false);

      this.worker.postMessage({
        type: "BG_REQUEST",
        context: "LOAD_BACKGROUND_SCRIPT",
        data: {
          endpoint: this.backgroundURL,
        },
      });
      this.worker.postMessage({
        type: "BG_REQUEST",
        context: "ACTIVATE",
      });
    }
  }

  terminateWorker() {
    if (this.worker) {
      this.worker.postMessage({
        type: "DEACTIVATE",
      });
      this.worker?.terminate();
      this.worker = null;
    }
  }

  async onMessage(event: any) {
    const { type, context, data } = event.data;

    console.log(event.data)

    if (type === "SDK_REQUEST") {
      switch (context) {
        case "window.dialog.showMessageBox": {
          const res = await window.dialog.showMessageBox(data);
          this.worker?.postMessage({
            type: "SDK_RESPONSE",
            context,
            data: res,
          });
          break;
        }
        case "window.dialog.showMessageBoxSync": {
          window.dialog.showMessageBoxSync(data);
          break;
        }
      }
    }
  }
}

class ExtensionManager {
  static instance: ExtensionManager | null = null;

  private extensions: Map<ExtensionID, Extension>;

  constructor() {
    this.extensions = new Map();
  }

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
  }

  removeExtension(id: ExtensionID) {
    if (!this.hasExtension(id)) return;

    const extension = this.extensions.get(id)!;

    extension.terminateWorker();

    this.extensions.delete(id);
  }

  getExtension(id: ExtensionID) {
    if (!this.hasExtension(id)) return null;

    return this.extensions.get(id)!;
  }
}

export default ExtensionManager;
