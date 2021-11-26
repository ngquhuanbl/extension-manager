import { loadScript } from "./load-scripts";

export const isValidExtensionID = (extensionID: ExtensionID) => extensionID.includes('extension');

export const loadExtension = async (extensionID: ExtensionID) => {
  const endpoints: Record<ExtensionID, string> = {
    "alert-extension": "http://localhost:3001/static/js/bundle.js",
    "ium-extension": "http://localhost:3002/static/js/bundle.js",
  };

  const extensionEndpoint = endpoints[extensionID];

  await loadScript(extensionEndpoint);
}