import { useUI } from "core/adapters/UI";
import { ComponentType } from "core/domain/componentRegistry";
import UIManager, { UIPosition } from "core/domain/UIManager";

import withSubscribedRender from './withSubscribedRender';

interface Props {
  position: UIPosition;
  componentType: ComponentType;
  childrenProps?: object;
}

const ComponentList: React.FC<Props> = ({
  position,
  componentType,
  childrenProps = {},
}) => {
  const { getRegisteredElementList } = useUI();
  return <>{getRegisteredElementList(position, componentType, childrenProps)}</>;
};

export default withSubscribedRender(
  ComponentList,
  [UIManager.getInstance().subscribe.bind(UIManager.getInstance())],
  [UIManager.getInstance().unsubscribe.bind(UIManager.getInstance())]
);
