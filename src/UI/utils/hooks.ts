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
      const listOfPositionComponent =
        UIManager.getInstance().getPositionComponentByPosition(position) || [];

      const listOfActivePositionComponent = listOfPositionComponent.filter(
        ({ status }) => status === "ACTIVE"
      );

      const listOfElements: React.ReactElement<
        any,
        string | React.JSXElementConstructor<any>
      >[] = [];
      listOfActivePositionComponent.forEach(({ id: currentID, status }) => {
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
      const listOfPositionComponent =
        UIManager.getInstance().getPositionComponentByPosition(position) || [];

      const listOfActivePositionComponent = listOfPositionComponent.filter(
        ({ status }) => status === "ACTIVE"
      );

      const numberOfActiveComponentIDs = listOfActivePositionComponent.length;

      if (numberOfActiveComponentIDs === 0) return null;

      const { id: lastComponentID } =
        listOfActivePositionComponent[numberOfActiveComponentIDs - 1];

      const lastComponentData =
        ComponentRegistry.getInstance().getComponentData(
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
