import { ComponentType } from "./componentRegistry";
import { UIPosition } from "./UIManager";

export interface ExtensionComponent {
  position: UIPosition;
  type: ComponentType;
  id: ExtensionComponentID;
}

export interface Extension {
  id: ExtensionID;
  name: string;
  components: Array<FrameworkExtensionComponent>;
}

class ExtensionManager {
  static instance: ExtensionManager | null = null;

  private extensions: Array<Extension>;

  constructor() {
    this.extensions = [];
  }

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ExtensionManager();
    }
    return this.instance;
  }

  hasExtension(id: ExtensionID) {

    return this.extensions.findIndex(({ id: currentId }) => id === currentId) !== -1;
  }

  addExtension(id: ExtensionID, extension: Extension) {
    if (this.hasExtension(id)) return;

    this.extensions.push(extension);
  }

  removeExtension(id: ExtensionID) {
    this.extensions = this.extensions.filter(({ id: currentId }) => id !== currentId);
  }

  getExtension(id: ExtensionID) {
    if (!this.hasExtension(id)) return null;

    return this.extensions.find(({ id: currentID }) => currentID === id)!;
  }
}

export default ExtensionManager;
