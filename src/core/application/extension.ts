import ExtensionManager, { Extension } from "../domain/extension-manager";
import {
  APIService,
  ComponentRegistryService,
  UIManagerService,
} from "./ports";

interface ExtensionDataComponent extends FrameworkExtensionComponent {
  component: FrameworkComponent;
}

export interface ExtensionData extends Extension {
  components: Array<ExtensionDataComponent>;
}

interface Dependencies {
  api: APIService;
  componentRegistry: ComponentRegistryService;
  uiManager: UIManagerService;
}

// TODO: Show install progress
export const installExtension = async (
  extensionID: ExtensionID,
  dependencies: Dependencies
) => {
  const { api, componentRegistry, uiManager } = dependencies;

  // 1. Download the extension data
  const { default: extensionData } = (await api.get(
    `/extensions/${extensionID}`
  )) as { default: ExtensionData };

  // 2. Register extension components and insert them to their corresponding positions
  const { components } = extensionData;
  components.forEach(({ id: componentId, type, component, position }, index) => {
    // 2.1 Register extension components
    componentRegistry.registerComponent(type, componentId, component);
    // 2.2. Insert extension components to their corresponding positions
    uiManager.insertItem(position, componentId);
  });

  // 3. Save extension
  ExtensionManager.getInstance().addExtension(extensionID, extensionData);

  // 4. Sync user extension list to the server
};

// TODO: Show uninstall progress
export const uninstallExtension = (
  extensionID: ExtensionID,
  dependencies: Pick<Dependencies, "componentRegistry" | "uiManager">
) => {
  const { componentRegistry, uiManager } = dependencies;

  const extension = ExtensionManager.getInstance().getExtension(extensionID);

  if (extension === null) return;

  const { components } = extension;
  components.forEach(({ id, type, position }) => {
    uiManager.removeItem(position, id);

    componentRegistry.removeComponent(type, id);
  });

  //Sync user extension list to the server
};
