import React from "react";

import withSubscribedRender from "../HOCs/withSubscribedRender";
import { useUI } from "UI/utils/hooks";
import UIManager from "UI/lib/ui-manager";

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
  const { getLastRegisteredElement } = useUI();

  const prioritizedElement = getLastRegisteredElement(
    position,
    componentType,
    childrenProps
  );

  return prioritizedElement;
};

export default withSubscribedRender(
  SingleItem,
  [
    [
      UIManager.getInstance().subscribe.bind(UIManager.getInstance()),
      UIManager.getInstance().unsubscribe.bind(UIManager.getInstance()),
    ],
  ],
  ["position"]
);
