import React, { useCallback, useEffect } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { ExtensionData } from "core/application/extension";
import { ChatIcon } from "@chakra-ui/icons";

interface Props {
  selectedItem: string;
  onSelect: (newSelectedItem: string) => void;
}

export const componentID = "zalo-chat-extension-0";

const Component: React.FC<Props> = ({ selectedItem, onSelect }) => {
  const onClick = useCallback(() => {
    onSelect(componentID);
  }, [onSelect]);

  useEffect(() => {
    // Select this toolbar icon by default
    onSelect(componentID);
  }, [onSelect]);

  return (
    <ToolbarIcon
      icon={<ChatIcon />}
      selected={selectedItem === componentID}
      onClick={onClick}
    />
  );
};

const extensionData: ExtensionData = {
  name: 'chat-extension',
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
