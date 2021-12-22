import { createStandaloneToast } from "@chakra-ui/toast";
import ExtensionInfoManager from "core/domain/extension-manager/extension-info-manager";
import withLazyCurrentRoot from "UI/components/HOCs/withLazyCurrentRoot";
import withLazyLegacyRoot from "UI/components/HOCs/withLazyLegacyRoot";
import withLegacyRoot from "UI/components/HOCs/withLegacyRoot";
import { extensionStatus2PositionComponentStatus } from "UI/utils/extensions";
import ExtensionManager from "../domain/extension-manager";
import { ComponentRegistryService, UIManagerService } from "./ports";

const toast = createStandaloneToast();

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

export interface ExtensionDataFromContentScript
  extends Omit<ExtensionInfo, "components"> {
  components: Array<ExtensionDataComponent>;
  createLegacyRoot?: (container: Element | DocumentFragment) => Root;
}

interface Dependencies {
  componentRegistry: ComponentRegistryService;
  uiManager: UIManagerService;
}

export const hasExtension = ExtensionManager.hasExtension;

export const installExtension = async (
  extensionData: ExtensionDataFromContentScript,
  dependencies: Dependencies
) => {
  const { componentRegistry, uiManager } = dependencies;

  const { id, createLegacyRoot, components, status } = extensionData;

  // STEP 1: APPLY CONTENT SCRIPT
  const extensionID = id;

  // 1.. Generate component ID + Register extension components and insert them to their corresponding positions
  const componentsWithIDs = components.map(function (componentData, index) {
    const { type, position, loadMode, id } = componentData;
    const componentID = id || extensionID + `-${index}`;
    // 1.1 Register extension components
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
    // 1.2. Insert extension components to their corresponding positions
    uiManager.insertItem(position, componentID, extensionStatus2PositionComponentStatus(status));

    // 1.3. Add generated ID to component data
    return {
      type,
      position,
      id: componentID,
    };
  });

  // STEP 2: SAVE EXTENSION
  const extensionInfo: ExtensionInfo = {
    ...extensionData,
    components: componentsWithIDs,
  };

  const extensionManager = ExtensionManager.getInstance();
  await extensionManager.saveExtension(extensionInfo);

  // STEP 3: PERSIST DATA
  const installedExtensions = JSON.parse(
    window.localStorage.getItem("extensions") || `{}`
  ) as PersistedExtensionDataStorage;

  installedExtensions[extensionID] = {
    displayName: extensionInfo.displayName,
    contentURL: extensionInfo.contentURL,
    backgroundURL: extensionInfo.backgroundURL,
    status: extensionInfo.status,
  };

  window.localStorage.setItem(
    "extensions",
    JSON.stringify(installedExtensions)
  );
};

export const uninstallExtension = async (
  extensionID: ExtensionID,
  dependencies: Dependencies
) => {
  // STEP 1: REMOVE ALL CONTENT APPLIED BY CONTENT SCRIPT
  const { componentRegistry, uiManager } = dependencies;
  const extensionManager = ExtensionManager.getInstance();

  const extensionInfo = ExtensionManager.getExtensionInfo(extensionID);
  if (extensionInfo === null) return;

  // Remove extension component from position and component registry
  const { components } = extensionInfo;
  components.forEach(({ id, type, position }) => {
    uiManager.removeItem(position, id);

    componentRegistry.removeComponent(type, id);
  });

  // STEP 2: UNSAVE EXTENSION
  await extensionManager.unsaveExtension(extensionID);

  // STEP 3: REMOVE PERSISTED DATA
  let installedExtensions = JSON.parse(
    window.localStorage.getItem("extensions") || `{}`
  ) as PersistedExtensionDataStorage;

  delete installedExtensions[extensionID];

  window.localStorage.setItem(
    "extensions",
    JSON.stringify(installedExtensions)
  );

  // STEP 4: Show step info
  toast({
    title: `'${extensionInfo.displayName}' extension is uninstalled!`,
    status: "success",
    isClosable: true,
    duration: 2000,
  });
};

export const subscribe = ExtensionManager.getInstance().subscribe.bind(
  ExtensionManager.getInstance()
);

export const unsubscribe = ExtensionManager.getInstance().unsubscribe.bind(
  ExtensionManager.getInstance()
);

export const dispatchMsgFromExtContentToExtBG =
  ExtensionManager.getInstance().dispatchMsgFromExtContentToExtBG.bind(
    ExtensionManager.getInstance()
  );

export const fetchExtension = ExtensionManager.fetchExtension;

export const setExtensionStatus = async (
  extensionID: ExtensionID,
  status: ExtensionStatus,
  dependencies: Pick<Dependencies, "uiManager">
) => {
  const { uiManager } = dependencies;

  const doesExtensionExist = ExtensionManager.hasExtension(extensionID);
  if (!doesExtensionExist) return;

  // STEP 1: UPDATE EXTENSION INFO
  const extensionManager = ExtensionManager.getInstance();
  extensionManager.updateExtensionInfo(extensionID, { status });
  // STEP 2: UPDATE UI MANAGER
  const extensionInfo = ExtensionManager.getExtensionInfo(extensionID);
  if (extensionInfo) {
    const { components } = extensionInfo;
    components.forEach(({ position, id }) => {
      const positionComponentStatus: PositionComponentStatus =
        extensionStatus2PositionComponentStatus(status);

      uiManager.setComponentStatus(position, id, positionComponentStatus);
    });

    // STEP 3: TERMINATE EXTENSION WORKER
    if (status === "DISABLED")
      await ExtensionManager.terminateExtensionWorker(extensionID);
  }

  // STEP 4: UPDATE PERSISTED DATA
  let installedExtensions = JSON.parse(
    window.localStorage.getItem("extensions") || `{}`
  ) as PersistedExtensionDataStorage;

  if (installedExtensions[extensionID]) {
    installedExtensions[extensionID].status = status;
  }

  window.localStorage.setItem(
    "extensions",
    JSON.stringify(installedExtensions)
  );
};

export const getExtensionStatus = (extensionID: ExtensionID) => {
  const extensionInfoManager = ExtensionInfoManager.getInstance();

  const extensionInfo = extensionInfoManager.getExtensionInfo(extensionID);

  if (!extensionInfo) return null;

  return extensionInfo.status;
};

export const dispatchMsgFromSDKToExtBG =
  ExtensionManager.getInstance().dispatchMsgFromSDKToExtBG.bind(
    ExtensionManager.getInstance()
  );
