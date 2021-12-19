import React, { useCallback } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { StarIcon } from "@chakra-ui/icons";

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
      icon={<StarIcon />}
      selected={selectedItem === componentID}
      onClick={onClick}
    />
  );
};

export default ExtensionManagerToolbarIcon;
