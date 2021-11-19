import ComponentRegistry from "../domain/componentRegistry";
import ExtensionManager, { Extension, ExtensionComponent } from "../domain/extensionManager";
import UIManager from "../domain/UIManager";
import { APIService } from "./ports";

interface ExtensionDataComponent extends ExtensionComponent {
  component: FrameworkComponent;
}

interface ExtensionData extends Extension {
  components: Array<ExtensionDataComponent>
}

interface Dependencies {
  api: APIService;
};

  // TODO: Show install progress
export const installExtension = async (extensionID: ExtensionID, dependencies: Dependencies) => {
  const { api } = dependencies;

  // 1. Download the extension data
  const { default: extensionData } = await api.get(`/extensions/${extensionID}`) as { default: ExtensionData };

  // 2. Register extension components and insert them to their corresponding positions
  const { id: extensionId, components } = extensionData;
  components.forEach(({ type, component, position }, index) => {
    const componentId = extensionId + index;
    // 2.1 Register extension components
    ComponentRegistry.getInstance().registerComponent(type, componentId, component);
    // 2.2. Insert extension components to their corresponding positions
    UIManager.getInstance().insertItem(position, componentId);
  })

  // 3. Save extension
  ExtensionManager.getInstance().addExtension(extensionID, extensionData);

  // 4. Sync user extension list to the server
}

  // TODO: Show uninstall progress
export const uninstallExtension = (extensionID: ExtensionID) => {
  const extension = ExtensionManager.getInstance().getExtension(extensionID);

  if (extension === null) return;

  const { components } = extension;
  components.forEach(({ id, type, position }) => {
    UIManager.getInstance().removeItem(position, id);

    ComponentRegistry.getInstance().removeComponent(type, id);
  })

  //Sync user extension list to the server
}