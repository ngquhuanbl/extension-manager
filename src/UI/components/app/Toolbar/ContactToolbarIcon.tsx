import React, { useCallback } from "react";
import ToolbarIcon from "UI/components/built-in/ToolbarIcon";
import { MdContacts } from 'react-icons/md';
import { Icon } from "@chakra-ui/react";


interface Props {
  selectedItem: string;
  onSelect: (newSelectedItem: string) => void;
}

export const componentID = "zalo-contact-extension-0";

const ContactToolbarIcon: React.FC<Props> = ({ selectedItem, onSelect }) => {
  const onClick = useCallback(() => {
    onSelect(componentID);
  }, [onSelect]);

  return (
    <ToolbarIcon
      icon={<Icon as={MdContacts} />}
      selected={selectedItem === componentID}
      onClick={onClick}
    />
  );
};

export default ContactToolbarIcon;
