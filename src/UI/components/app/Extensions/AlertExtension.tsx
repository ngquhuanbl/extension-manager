import { Button } from "@chakra-ui/button";
import { GridItem } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { loadExtension } from "UI/utils/extensions";

const AlertExtension: React.FC = () => {
  const handleClick = useCallback(async () => {
    await loadExtension('alert-extension')
  }, []);

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
