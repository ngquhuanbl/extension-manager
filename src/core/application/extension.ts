import withLazyCurrentRoot from "UI/components/HOCs/withLazyCurrentRoot";
import withLazyLegacyRoot from "UI/components/HOCs/withLazyLegacyRoot";
import withLegacyRoot from "UI/components/HOCs/withLegacyRoot";
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
  Omit<FrameworkExtensionComponent, "id"> &
  Partial<Pick<FrameworkExtensionComponent, "id">>;

export interface ExtensionData {
  name: string;
  publisher: string;
  activationEvents: string[];
  components: Array<ExtensionDataComponent>;
  backgroundURL?: string;
  createLegacyRoot?: (container: Element | DocumentFragment) => Root;
}

interface Dependencies {
  componentRegistry: ComponentRegistryService;
  uiManager: UIManagerService;
}

export const hasExtension = ExtensionManager.getInstance().hasExtension.bind(
  ExtensionManager.getInstance()
);

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
    backgroundURL,
  } = extensionData;

  const extensionID = Extension.getExtensionID(name, publisher);

  // 2. Generate component ID + Register extension components and insert them to their corresponding positions
  const componentsWithIDs = components.map(function (componentData, index) {
    const { type, position, loadMode, id } = componentData;
    const componentID = id || extensionID + `-${index}`;
    // 2.1 Register extension components
    switch (loadMode) {
      case "sync": {
        const { component } = componentData;
        componentRegistry.registerComponent(
          type,
          componentID,
          createLegacyRoot
            ? withLegacyRoot(component, createLegacyRoot)
            : component
        );
        break;
      }
      case "lazy": {
        const { component } = componentData;
        componentRegistry.registerComponentUsingGetter(
          type,
          componentID,
          createLegacyRoot
            ? withLazyLegacyRoot(component, createLegacyRoot)
            : withLazyCurrentRoot(component)
        );
        break;
      }
      default:
    }
    // 2.2. Insert extension components to their corresponding positions
    uiManager.insertItem(position, componentID);

    // 2.3. Add generated ID to component data
    return {
      type,
      position,
      id: componentID,
    };
  });

  // 3. Save extension
  const extension = new Extension(
    name,
    publisher,
    activationEvents,
    componentsWithIDs,
    backgroundURL
  );

  const extensionManager = ExtensionManager.getInstance();
  extensionManager.addExtension(extensionID, extension);

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
  manifestData: ManifestData,
  message: WorkerMessageFromContentScript
) => {
  return new Promise((resolve, reject) => {
    const extensionManager = ExtensionManager.getInstance();

    const { name, publisher } = manifestData;
    const extensionID = Extension.getExtensionID(name, publisher);

    const extension = extensionManager.getExtension(extensionID);
    if (!extension) reject(new Error("Non-existed extension"));

    const { worker } = extension!;
    const isExtensionActive = worker !== null;
    if (!isExtensionActive) reject(new Error("Non-active extension"));

    const bgRequestMessage: WorkerMessage = {
      ...message,
      type: "BG_REQUEST",
      manifestData,
    };
    worker!.postMessage(bgRequestMessage);

    const { context: requestContext } = message;

    const callback = (event: any) => {
      const { data } = event;
      const { type: responseType, context: responseContext } = data;

      const expectedResponseType = "BG_RESPONSE";

      if (
        responseType === expectedResponseType &&
        requestContext === responseContext
      ) {
        worker!.removeEventListener("message", callback);
        resolve(data);
      }
    };

    worker!.addEventListener("message", callback);
  });
};
