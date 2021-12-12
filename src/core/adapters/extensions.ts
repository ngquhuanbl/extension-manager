import {
  ExtensionData,
  installExtension,
  postMessageToExtensionBG,
  uninstallExtension,
  hasExtension
} from "../application/extension";
import { useComponentRegistry } from "./component-registry";
import { useUIManager } from "./ui-manager";

export const useExtension = () => {
  const componentRegistry = useComponentRegistry();
  const uiManager = useUIManager();

  return {
    hasExtension,
    installExtension: (extensionData: ExtensionData) =>
      installExtension(extensionData, { componentRegistry, uiManager }),
    uninstallExtension: (extensionID: ExtensionID) =>
      uninstallExtension(extensionID, { componentRegistry, uiManager }),
    postMessageToExtensionBG,
  };
};
