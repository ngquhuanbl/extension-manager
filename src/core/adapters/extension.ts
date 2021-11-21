import { installExtension, uninstallExtension } from "../application/extension";
import { useAPI } from "./api";
import { useComponentRegistry } from "./component-registry";
import { useUIManager } from "./ui-manager";

export const useExtension = () => {
  const api = useAPI();
  const componentRegistry = useComponentRegistry();
  const uiManager = useUIManager();

  return {
    installExtension: (extensionID: ExtensionID) =>
      installExtension(extensionID, { api, componentRegistry, uiManager }),
    uninstallExtenion: (extensionID: ExtensionID) =>
      uninstallExtension(extensionID, { componentRegistry, uiManager }),
  };
};
