import { Button } from "@chakra-ui/button";
import { GridItem } from "@chakra-ui/layout";
import { Text } from '@chakra-ui/react';
import { useExtension } from "core/adapters/extension";
import React, { useCallback } from "react";

const IUMExtension: React.FC = () => {
  const { installExtension } = useExtension();

  const handleClick = useCallback(() => {
    installExtension("665386c57-db49-529f-a0d6-807a040d6032-ium");
  }, [installExtension]);
  return (
    <>
      <GridItem colSpan={1} display="flex" alignItems="center">
        <Text>Image Upload Message extension</Text>
      </GridItem>
      <GridItem colSpan={1} onClick={handleClick}>
        <Button colorScheme="teal">Install</Button>
      </GridItem>
    </>
  );
};

export default IUMExtension;
