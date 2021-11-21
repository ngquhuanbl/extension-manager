import React from "react";
import ComponentRegistry from "UI/lib/component-registry";
import UIManager from "UI/lib/ui-manager";

export const useUI = () => {
  return {
    getRegisteredElementList: (
      position: UIPosition,
      componentType: ComponentType,
      childrenProps: object = {}
    ) => {
      const listOfComponentIDs =
        UIManager.getInstance().getComponentIDsByPosition(position) || [];

      const listOfElements: React.ReactElement<
        any,
        string | React.JSXElementConstructor<any>
      >[] = [];
      listOfComponentIDs.forEach((currentID) => {
        const componentData = ComponentRegistry.getInstance().getComponentData(
          componentType,
          currentID
        );
        if (componentData !== null) {
          const { id, component } = componentData;
          const element = React.createElement(component, {
            ...childrenProps,
            key: id,
          });
          listOfElements.push(element);
        }
      });

      return listOfElements;
    },
    getLastRegisteredElement: (
      position: UIPosition,
      componentType: ComponentType,
      childrenProps: object = {}
    ) => {
      const listOfComponentIDs =
        UIManager.getInstance().getComponentIDsByPosition(position) || [];

      const numberOfComponentIDs = listOfComponentIDs.length;

      if (numberOfComponentIDs === 0) return null;

      const lastComponentID = listOfComponentIDs[numberOfComponentIDs - 1];

      const lastComponentData = ComponentRegistry.getInstance().getComponentData(
        componentType,
        lastComponentID
      );
      if (lastComponentData === null) return null;

      const { id, component } = lastComponentData;
      const lastElement = React.createElement(component, {
        ...childrenProps,
        key: id,
      });

      return lastElement;
    },
  };
};
