import { installExtension, uninstallExtension } from "../application/extension"
import { useAPI } from "./api"

export const useExtension = () => {
  const api = useAPI();

  return {
    installExtension: (extensionID: ExtensionID) => installExtension(extensionID, { api }),
    uninstallExtenion: (extensionID: ExtensionID) => uninstallExtension(extensionID)
  }
}