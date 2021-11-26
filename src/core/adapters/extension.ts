import { ExtensionData, installExtension, uninstallExtension } from "../application/extension";
import { useComponentRegistry } from "./component-registry";
import { useUIManager } from "./ui-manager";

export const useExtension = () => {
  const componentRegistry = useComponentRegistry();
  const uiManager = useUIManager();

  return {
    installExtension: (extensionData: ExtensionData) =>
      installExtension(extensionData, { componentRegistry, uiManager }),
    uninstallExtenion: (extensionID: ExtensionID) =>
      uninstallExtension(extensionID, { componentRegistry, uiManager }),
  };
};
