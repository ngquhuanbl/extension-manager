import React, { useCallback } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { StarIcon } from "@chakra-ui/icons";
import { ExtensionDataFromContentScript } from "core/application/extension-manager";

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

const extensionData: ExtensionDataFromContentScript = {
  id: 'zalo-extension-manager-extension',
  name: 'extension-manager-extension',
  publisher: 'zalo',
  displayName: 'Extension manager extension',
  components: [{
    id: componentID,
    position: 'UI_POSITION/TOOLBAR',
    type: 'COMPONENT_TYPE/TOOLBAR_ICON',
    component: Component,
    loadMode: 'sync'
  }],
  activationEvents: ['*'],
  backgroundURL: '',
  contentURL: ''
};
export default extensionData;
