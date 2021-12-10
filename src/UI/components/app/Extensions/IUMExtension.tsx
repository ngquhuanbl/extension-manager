import { Button } from "@chakra-ui/button";
import { GridItem } from "@chakra-ui/layout";
import { Text } from '@chakra-ui/react';
import React, { useCallback } from "react";
import { loadExtension } from "UI/utils/extensions";

const IUMExtension: React.FC = () => {
  const handleClick = useCallback(() => {
    loadExtension("ium-extension");
  }, []);
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
