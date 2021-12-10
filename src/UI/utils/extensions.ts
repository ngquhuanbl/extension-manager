import { loadScript } from "./load-scripts";

interface ExtensionEnpoints {
  content: string;
  background: string;
}

export const loadExtension = (extensionID: ExtensionID) => {
  const endpoints: Record<ExtensionID, ExtensionEnpoints> = {
    "alert-extension": {
      content: 'http://localhost:3001/static/js/content.bundle.js',
      background: 'http://localhost:3001/static/js/background.bundle.js'
    },
    "ium-extension": {
      content: 'http://localhost:3002/static/js/content.bundle.js',
      background: 'http://localhost:3002/static/js/background.bundle.js'
    }
  };

  const { content, background } = endpoints[extensionID];

  loadScript(content, { background });
}