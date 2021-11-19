import React from "react";

import withSubscribedRender from './withSubscribedRender';
import { useUI } from "core/adapters/UI";
import UIManager, { UIPosition } from "core/domain/UIManager";
import { ComponentType } from "core/domain/componentRegistry";

interface Props {
  position: UIPosition;
  componentType: ComponentType;
  childrenProps?: object;
}

const SingleItem: React.FC<Props> = ({
  position,
  componentType,
  childrenProps = {},
}) => {
  const { getLastRegisteredElementList } = useUI();

  const prioritizedElement = getLastRegisteredElementList(position, componentType, childrenProps);

  return prioritizedElement;
};

export default withSubscribedRender(
  SingleItem,
  [UIManager.getInstance().subscribe.bind(UIManager.getInstance())],
  [UIManager.getInstance().unsubscribe.bind(UIManager.getInstance())]
);
