import ComponentRegistry from "UI/lib/component-registry";
import UIManager from "UI/lib/ui-manager";
import BuiltInMessage from "UI/components/built-in/Message";
import { useExtension } from "core/adapters/extension";
import { isValidExtensionID } from "./extensions";

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

export const overrideDefineFunction = () => {
  (window as any).define = function () {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { installExtension } = useExtension();

    const extensionID = arguments[0];
    const dependencyNameList = arguments[1];
    const executor = arguments[2];

    if (typeof extensionID !== "string" || !isValidExtensionID(extensionID))
      return;

    Promise.all(
      // Prepare required dependencies for executor
      dependencyNameList.map((depName: string) => {
        return defaultExtensionDependencies[depName];
      })
    ).then((executorDependencies) => {
      // Execute the executor
      const { default: extensionData } = executor(
        ...executorDependencies
      );
      installExtension(extensionData);
    });
  };
};
