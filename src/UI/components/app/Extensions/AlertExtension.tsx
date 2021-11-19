import { Button } from "@chakra-ui/button";
import { GridItem } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useExtension } from "core/adapters/extension";
import React, { useCallback } from "react";

const AlertExtension: React.FC = () => {
  const { installExtension } = useExtension();

  const handleClick = useCallback(() => {
    installExtension("6af24829-224c-5e03-bb9c-3cd97b24729f-alert");
  }, [installExtension]);

  return (
    <>
      <GridItem colSpan={1} display="flex" alignItems="center">
        <Text>Alert extension</Text>
      </GridItem>
      <GridItem colSpan={1}>
        <Button colorScheme="teal" onClick={handleClick}>
          Install
        </Button>
      </GridItem>
    </>
  );
};

export default AlertExtension;
