/* eslint-disable react-hooks/rules-of-hooks */
import { createExtensionID } from "./extensions";
import { useExtensionManager } from "core/adapters/extensions-manager";
import { useMessageManager } from "core/adapters/message-manager";
import { useSDK } from "core/adapters/sdk";

const defaultExtensionDependencies = {
  "@chakra-ui/icons": import("@chakra-ui/icons"),
  "@chakra-ui/react": import("@chakra-ui/react"),
  "@emotion/react": import("@emotion/react"),
  "@emotion/styled": import("@emotion/styled"),
  "framer-motion": import("framer-motion"),
  react: import("react"),
  "react-dom": import("react-dom"),
} as Record<string, Promise<any>>;


export const createDefineExtFunction = () => {
  (window as any).defineExt = function () {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { installExtension } = useExtensionManager();

    const manifestData = arguments[0] as ExtensionManifestData;
    const dependencyNameList = arguments[1];
    const executor = arguments[2];

    const currentScript =
      document.currentScript ||
      (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1];
      })();

    const contentURL = currentScript.getAttribute("src");
    const backgroundURL = currentScript.getAttribute("param-background");
    if (!backgroundURL) return;

    return Promise.all(
      // Prepare required dependencies for executor
      dependencyNameList.map((depName: string) => {
        return defaultExtensionDependencies[depName];
      })
    ).then((executorDependencies) => {
      // Execute the executor
      const { default: extensionContentData } = executor(
        ...executorDependencies
      );

      const { name, publisher } = manifestData;

      const extensionID = createExtensionID(name, publisher);

      // Combine manifest data + content script data
      const extensionData = {
        ...manifestData,
        ...extensionContentData,
        id: extensionID,
        backgroundURL,
        contentURL
      };
      installExtension(extensionData);
    });
  };
};

export const createDispatchMsgFromExtContentFunction = () => {
  const { createReq } = useMessageManager();
  const { dispatchMsgFromExtContentToExtBG } = useExtensionManager();
  const { dispatchMsgFromExtContentToSDK } = useSDK();

  // This global function will only be call from content script extension
  (window as any).dispatchMsgFromExtContent = function (data: Message) {
    const { target, meta } = data;
    const { fireAndForget } = meta;

    let processor: GenericFunction = () => {};

    if (target === "sdk") {
      // The message is sent to SDK
      processor = dispatchMsgFromExtContentToSDK;
    } else {
      // The message is sent to background scripts
      processor = dispatchMsgFromExtContentToExtBG;
    }

    if (fireAndForget) {
      processor(data);
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        const req = createReq(data);

        processor(req);

        resolve(req.result);
      });
    }
  };
};

export const createDispatchMsgFromSDKFunction = () => {
  const { createReq } = useMessageManager();
  const { dispatchMsgFromSDKToExtBG } = useExtensionManager();

  // This global function will only be call from content script extension
  (window as any).dispatchMsgFromSDK = function (data: Message) {
    const { meta } = data;
    const { fireAndForget } = meta;

    let processor: GenericFunction = dispatchMsgFromSDKToExtBG;

    if (fireAndForget) {
      processor(data);
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        const req = createReq(data);

        processor(req);

        resolve(req.result);
      });
    }
  };
};

export const installPersistedExtensions = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { fetchExtension } = useExtensionManager();
  const installedExtensions = JSON.parse(
    window.localStorage.getItem("extensions") || `{}`
  );

  Object.entries(installedExtensions).forEach(
    ([id, { displayName, contentURL, backgroundURL }]: [any, any]) => {
      fetchExtension(id, displayName, contentURL, backgroundURL, "silent");
    }
  );
};
