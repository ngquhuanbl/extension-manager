import React, { useCallback } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { ExtensionData } from "core/application/extension";
import { StarIcon } from "@chakra-ui/icons";

interface Props {
  selectedItem: string;
  onSelect: (newSelectedItem: string) => void;
}

export const componentID = "zalo-extension-manager-extension-0";

const Component: React.FC<Props> = ({ selectedItem, onSelect }) => {
  const onClick = useCallback(() => {
    onSelect(componentID);
  }, [onSelect]);

  return (
    <ToolbarIcon
      icon={<StarIcon />}
      selected={selectedItem === componentID}
      onClick={onClick}
    />
  );
};

const extensionData: ExtensionData = {
  name: 'extension-manager-extension',
  publisher: 'zalo',
  components: [{
    id: componentID,
    position: 'UI_POSITION/TOOLBAR',
    type: 'COMPONENT_TYPE/TOOLBAR_ICON',
    component: Component,
    loadMode: 'sync'
  }],
  activationEvents: ['*']
};
export default extensionData;
