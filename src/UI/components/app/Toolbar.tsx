import { Flex } from '@chakra-ui/layout';
import React from 'react';
import ComponentList from './ComponentList';

interface Props {
  selectedItem: string;
  onSelect: (newSelectedItem: string) => void;
}

const Toolbar: React.FC<Props> = ({
  selectedItem,
  onSelect
}) => {
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
        {/* <div> */}
          <ComponentList
            position="UI_POSITION/TOOLBAR"
            componentType="COMPONENT_TYPE/TOOLBAR_ICON"
            childrenProps={{
              selectedItem,
              onSelect
            }}
          />
        {/* </div> */}
      </Flex>
  );
}

export default Toolbar;
