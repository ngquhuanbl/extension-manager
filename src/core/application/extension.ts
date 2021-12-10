import withLazyLegacyRoot from "UI/components/app/withLazyLegacyRoot";
import withLegacyRoot from "UI/components/app/withLegacyRoot";
import ExtensionManager, { Extension } from "../domain/extension-manager";
import { ComponentRegistryService, UIManagerService } from "./ports";

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

export interface ExtensionData extends Omit<Extension, "components"> {
  components: Array<ExtensionDataComponent>;
  createLegacyRoot: (container: Element | DocumentFragment) => Root;
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

  const {
    name,
    publisher,
    createLegacyRoot,
    activationEvents,
    components,
    backgroundURL: backgroundBlob,
  } = extensionData;

  const extensionID = Extension.createExtensionID(name, publisher);

  // 2. Generate component ID + Register extension components and insert them to their corresponding positions
  const componentsWithIDs = components.map(function (componentData, index) {
    const { type, position, loadMode } = componentData;
    const componentID = extensionID + `-${index}`;
    // 2.1 Register extension components
    switch (loadMode) {
      case "sync": {
        const { component } = componentData;
        componentRegistry.registerComponent(
          type,
          componentID,
          withLegacyRoot(component, createLegacyRoot)
        );
        break;
      }
      case "lazy": {
        const { component } = componentData;
        componentRegistry.registerComponentUsingGetter(
          type,
          componentID,
          withLazyLegacyRoot(component, createLegacyRoot)
        );
        break;
      }
      default:
    }
    // 2.2. Insert extension components to their corresponding positions
    uiManager.insertItem(position, componentID);

    // 2.3. Add generated ID to component data
    return {
      ...componentData,
      id: componentID,
    };
  });

  // 3. Save extension
  const extension = new Extension(
    name,
    publisher,
    activationEvents,
    componentsWithIDs,
    backgroundBlob
  );
  ExtensionManager.getInstance().addExtension(extensionID, extension);

  // 4. Sync user extension list to the server
};

// TODO: Show uninstall progress
export const uninstallExtension = (
  extensionID: ExtensionID,
  dependencies: Pick<Dependencies, "componentRegistry" | "uiManager">
) => {
  const { componentRegistry, uiManager } = dependencies;
  const extensionManager = ExtensionManager.getInstance();

  const extension = extensionManager.getExtension(extensionID);
  if (extension === null) return;

  // Remove extension component from position and component registry
  const { components } = extension;
  components.forEach(({ id, type, position }) => {
    uiManager.removeItem(position, id);

    componentRegistry.removeComponent(type, id);
  });

  // Remove the extension from extension manager
  extensionManager.removeExtension(extensionID);

  //Sync user extension list to the server
};

export const postMessageToExtensionBG = (
  extensionID: ExtensionID,
  message: WorkerMessage
) => {
  return new Promise((resolve, reject) => {
    const extensionManager = ExtensionManager.getInstance();
    const extension = extensionManager.getExtension(extensionID);

    if (!extension) reject(new Error("Non-existed extension"));

    const { worker } = extension!;

    const isExtensionActive = worker !== null;

    if (!isExtensionActive) reject(new Error("Non-active extension"));

    worker!.postMessage(message);

    const { type: requestType, context: requestContext } = message;

    worker!.addEventListener(
      "message",
      (event: any) => {
        const { data } = event;
        const { type: responseType, context: responseContext } = data;

        const expectedResponseType = requestType.replace("REQUEST", "RESPONSE");

        if (
          responseType === expectedResponseType &&
          requestContext === responseContext
        ) {
          resolve(data);
        }
      },
      false
    );
  });
};
