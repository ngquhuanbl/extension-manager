import ExtensionManager, { Extension } from "../domain/extension-manager";
import { ComponentRegistryService, UIManagerService } from "./ports";

// interface ExtensionDataComponent
//   extends Omit<FrameworkExtensionComponent, "id"> {
//   loadMode: 'synchronous' | 'lazy';
//   component: FrameworkComponent;
// }

type ExtensionDataComponent = (
  | {
      loadMode: "sync";
      component: FrameworkComponent;
    }
  | {
      loadMode: "lazy";
      component: () => Promise<{ default: FrameworkComponent }>;
    }
) &
  Omit<FrameworkExtensionComponent, "id">;

export interface ExtensionData extends Pick<Extension, "id" | "name"> {
  components: Array<ExtensionDataComponent>;
}

interface Dependencies {
  componentRegistry: ComponentRegistryService;
  uiManager: UIManagerService;
}

// TODO: Show install progress
export const installExtension = async (
  extensionData: ExtensionData,
  dependencies: Dependencies
) => {
  const { componentRegistry, uiManager } = dependencies;
  const extensionDataWithComponentIDs = Object.assign(
    {},
    extensionData
  ) as any as Extension;

  // 2. Register extension components and insert them to their corresponding positions
  const { id: extensionID, components } = extensionData;
  components.forEach((componentData, index) => {
    const { type, position, loadMode } = componentData;
    const componentID = extensionID + `-${index}`;
    // 2.1 Register extension components
    switch (loadMode) {
      case "sync": {
        const { component } = componentData;
        componentRegistry.registerComponent(type, componentID, component);
        break;
      }
      case "lazy": {
        const { component } = componentData;
        componentRegistry.registerComponentUsingGetter(
          type,
          componentID,
          component
        );
        break;
      }
      default:
    }
    // 2.2. Insert extension components to their corresponding positions
    uiManager.insertItem(position, componentID);
    // 2.3. Add generated componentID to extension data
    extensionDataWithComponentIDs.components[index].id = componentID;
  });

  // 3. Save extension
  ExtensionManager.getInstance().addExtension(
    extensionID,
    extensionDataWithComponentIDs
  );

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
