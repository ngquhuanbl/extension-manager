import React, { useCallback, useEffect } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { ExtensionDataFromContentScript } from "core/application/extension-manager";
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

const extensionData: ExtensionDataFromContentScript = {
  id: 'zalo-chat-extension',
  name: 'chat-extension',
  publisher: 'zalo',
  displayName: 'Chat extension',
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
