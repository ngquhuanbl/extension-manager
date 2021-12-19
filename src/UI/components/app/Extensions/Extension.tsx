import { Button } from "@chakra-ui/button";
import { Flex, HStack, Spacer } from "@chakra-ui/layout";
import { Avatar, Text } from "@chakra-ui/react";
import { useExtensionManager } from "core/adapters/extensions-manager";
import React, { useCallback } from "react";
import withSubscribedRender from "UI/components/HOCs/withSubscribedRender";

export interface Props {
  id: ExtensionID;
  displayName: string;
}

const Extension: React.FC<Props> = ({
  id,
  displayName,
}) => {
  const { hasExtension, fetchExtension, uninstallExtension } = useExtensionManager();

  const handleUninstall = useCallback(() => {
    uninstallExtension(id);
  }, [uninstallExtension, id]);

  const handleInstall = useCallback(() => {
    fetchExtension(id);
  }, [fetchExtension, id]);

  return (
    <Flex w="100%">
      <HStack>
        <Avatar name={displayName} />
        <Text>{displayName}</Text>
      </HStack>
      <Spacer />
      {hasExtension(id) ? (
        <Button colorScheme="red" onClick={handleUninstall}>
          Uninstall
        </Button>
      ) : (
        <Button colorScheme="teal" onClick={handleInstall}>
          Install
        </Button>
      )}
    </Flex>
  );
};

// eslint-disable-next-line react-hooks/rules-of-hooks
const { subscribe, unsubscribe } = useExtensionManager();

export default withSubscribedRender(
  Extension,
  [[subscribe, unsubscribe]],
  ["id"]
);
