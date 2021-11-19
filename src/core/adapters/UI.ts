import { getRegisteredComponentDataList } from "core/application/UI";
import { ComponentType } from "core/domain/componentRegistry";
import { UIPosition } from "core/domain/UIManager";
import React from "react";

export const useUI = () => {
  return {
    getRegisteredElementList: (
      position: UIPosition,
      componentType: ComponentType,
      childrenProps: object = {}
    ) => {
      const componentDataList = getRegisteredComponentDataList(position, componentType);

      const propsInjectedElementList = componentDataList.map(({ id, component }) =>
        React.createElement(component, { ...childrenProps, key: id })
      );

      return propsInjectedElementList;
    },
    getLastRegisteredElementList: (
      position: UIPosition,
      componentType: ComponentType,
      childrenProps: object = {}
    ) => {
      const componentDataList = getRegisteredComponentDataList(position, componentType);

      const length = componentDataList.length;

      if (length === 0) return null;

      const lastComponentData = componentDataList[length - 1];
      const { component, id } = lastComponentData;

      return React.createElement(component, { ...childrenProps, key: id });
    },
  };
};
