

export interface ExtensionInfo extends ExtensionManifestData {
  id: ExtensionID;
  backgroundURL: string;
  contentURL: string;
  components: Array<ExtensionComponent>;
}

interface ExtensionComponent {
  position: UIPosition;
  type: ComponentType;
  id: ExtensionComponentID;
}

class ExtensionInfoManager {
  private static instance: ExtensionInfoManager | null = null;

  extensionInfoMap: Map<ExtensionID, ExtensionInfo> = new Map();

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ExtensionInfoManager();
    }
    return this.instance;
  }

  hasExtensionInfo(id: ExtensionID) {
    return this.extensionInfoMap.has(id);
  }

  saveExtensionInfo(data: ExtensionInfo) {
    const { id } = data;

    if (this.hasExtensionInfo(id)) return;

    this.extensionInfoMap.set(id, data);
  }

  removeExtensionInfo(id: ExtensionID) {
    this.extensionInfoMap.delete(id);
  }

  getExtensionInfo(id: ExtensionID) {
    return this.extensionInfoMap.get(id) || null;
  }
}

export default ExtensionInfoManager;