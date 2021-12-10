import ComponentRegistry from "UI/lib/component-registry";
import UIManager from "UI/lib/ui-manager";
import BuiltInMessage from "UI/components/built-in/Message";
import { useExtension } from "core/adapters/extension";
import { postMessageToExtensionBG } from "core/application/extension";

const defaultExtensionDependencies = {
  "@chakra-ui/icons": import("@chakra-ui/icons"),
  "@chakra-ui/react": import("@chakra-ui/react"),
  "@emotion/react": import("@emotion/react"),
  "@emotion/styled": import("@emotion/styled"),
  "framer-motion": import("framer-motion"),
  react: import("react"),
  "react-dom": import("react-dom"),
} as Record<string, Promise<any>>;

export const initDefaultUI = () => {
  const builtInMessageID = "0b16542f-db1a-52d3-94d2-1bb828e42c40";
  ComponentRegistry.getInstance().registerComponent(
    "COMPONENT_TYPE/MESSAGE",
    builtInMessageID,
    BuiltInMessage
  );

  UIManager.getInstance().insertItem("UI_POSITION/CONTENT", builtInMessageID);
};

export const createDefineExtFunction = () => {
  (window as any).defineExt = function () {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { installExtension } = useExtension();

    const manifestData = arguments[0];
    const dependencyNameList = arguments[1];
    const executor = arguments[2];

    const currentScript =
      document.currentScript ||
      (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1];
      })();

    const backgroundScript = currentScript.getAttribute("param-background");
    if (!backgroundScript) return;

    fetch(backgroundScript)
      .then((response) => response.blob())
      .then((backgroundBlob) => {
        const backgroundURL = URL.createObjectURL(backgroundBlob);

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

          // Combine manifest data + content script data
          const extensionData = {
            ...manifestData,
            ...extensionContentData,
            backgroundURL,
          };
          installExtension(extensionData);
        });
      });
  };
};

export const createPostMessageToBGFunction = () => {
  (window as any).postMessageToExtensionBG = postMessageToExtensionBG;
};
