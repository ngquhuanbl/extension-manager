import React, { useCallback } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { MdExtension } from 'react-icons/md';
import Icon from "@chakra-ui/icon";

interface Props {
  selectedItem: string;
  onSelect: (newSelectedItem: string) => void;
}

export const componentID = "zalo-extension-manager-extension-0";

const ExtensionManagerToolbarIcon: React.FC<Props> = ({ selectedItem, onSelect }) => {
  const onClick = useCallback(() => {
    onSelect(componentID);
  }, [onSelect]);

  return (
    <ToolbarIcon
      icon={<Icon as={MdExtension} />}
      selected={selectedItem === componentID}
      onClick={onClick}
    />
  );
};

export default ExtensionManagerToolbarIcon;
