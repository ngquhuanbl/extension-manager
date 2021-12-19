import { Flex } from "@chakra-ui/layout";
import React from "react";
import ChatToolbarIcon from "./ChatToolbarIcon";
import ComponentList from "../ComponentList";
import ExtensionManagerToolbarIcon from "./ExtensionManagerToolbarIcon";

interface Props {
  selectedItem: string;
  onSelect: (newSelectedItem: string) => void;
}

const Toolbar: React.FC<Props> = ({ selectedItem, onSelect }) => {
  return (
    <Flex
      w="70px"
      bg="blue.500"
      paddingTop={4}
      flexDirection="column"
      alignItems="center"
      sx={{
        "& > *": {
          marginBottom: "16px",
        },
      }}
    >
      <ChatToolbarIcon selectedItem={selectedItem} onSelect={onSelect} />
      <ExtensionManagerToolbarIcon
        selectedItem={selectedItem}
        onSelect={onSelect}
      />
      <ComponentList
        position="UI_POSITION/TOOLBAR"
        componentType="COMPONENT_TYPE/TOOLBAR_ICON"
        childrenProps={{
          selectedItem,
          onSelect,
        }}
      />
    </Flex>
  );
};

export default Toolbar;
