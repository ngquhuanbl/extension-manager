import {
  ExtensionDataFromContentScript,
  installExtension,
  uninstallExtension,
  hasExtension,
  subscribe,
  unsubscribe,
  dispatchMsgFromExtContentToExtBG,
  fetchExtension
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
    installExtension: (extensionData: ExtensionDataFromContentScript) =>
      installExtension(extensionData, { componentRegistry, uiManager }),
    uninstallExtension: (extensionID: ExtensionID) =>
      uninstallExtension(extensionID, { componentRegistry, uiManager }),
  };
};
