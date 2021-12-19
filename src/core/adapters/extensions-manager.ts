import {
  ExtensionDataFromContentScript,
  installExtension,
  uninstallExtension,
  hasExtension,
  subscribe,
  unsubscribe,
  dispatchMsgFromExtContentToExtBG,
  fetchExtension,
  getExtensionStatus,
  setExtensionStatus,
} from "../application/extension-manager";
import { useComponentRegistry } from "./component-registry";
import { useUIManager } from "./ui-manager";

export const useExtensionManager = () => {
  const componentRegistry = useComponentRegistry();
  const uiManager = useUIManager();

  return {
    hasExtension,
    subscribe,
    unsubscribe,
    dispatchMsgFromExtContentToExtBG,
    fetchExtension,
    getExtensionStatus,
    setExtensionStatus: (extensionID: ExtensionID, status: ExtensionStatus) =>
      setExtensionStatus(extensionID, status, { uiManager }),
    installExtension: (extensionData: ExtensionDataFromContentScript) =>
      installExtension(extensionData, { componentRegistry, uiManager }),
    uninstallExtension: (extensionID: ExtensionID) =>
      uninstallExtension(extensionID, { componentRegistry, uiManager }),
  };
};
