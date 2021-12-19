import React, { useCallback, useEffect } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { ChatIcon } from "@chakra-ui/icons";

interface Props {
  selectedItem: string;
  onSelect: (newSelectedItem: string) => void;
}

export const componentID = "zalo-chat-extension-0";

const ChatToolbarIcon: React.FC<Props> = ({ selectedItem, onSelect }) => {
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

export default ChatToolbarIcon;
