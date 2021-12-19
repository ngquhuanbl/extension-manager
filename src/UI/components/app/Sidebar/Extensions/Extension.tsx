import { Button } from "@chakra-ui/button";
import { Flex, HStack, Spacer } from "@chakra-ui/layout";
import { Avatar, Text } from "@chakra-ui/react";
import { useExtensionManager } from "core/adapters/extensions-manager";
import React, { useCallback, useMemo } from "react";
import withSubscribedRender from "UI/components/HOCs/withSubscribedRender";

export interface Props {
  id: ExtensionID;
  displayName: string;
  contentURL: string;
  backgroundURL: string;
}

const Extension: React.FC<Props> = ({
  id,
  displayName,
  contentURL,
  backgroundURL,
}) => {
  const {
    hasExtension,
    fetchExtension,
    uninstallExtension,
    getExtensionStatus,
    setExtensionStatus,
  } = useExtensionManager();

  const extensionStatus = getExtensionStatus(id);

  const handleEnableExtension = useCallback(() => {
    setExtensionStatus(id, "ENABLED");
  }, [id, setExtensionStatus]);

  const handleDisableExtension = useCallback(() => {
    setExtensionStatus(id, "DISABLED");
  }, [id, setExtensionStatus]);

  const extensionStatusButton = useMemo(() => {
    switch (extensionStatus) {
      case "ENABLED":
        return (
          <Button colorScheme="red" onClick={handleDisableExtension}>
            Disable
          </Button>
        );
      case "DISABLED":
        return (
          <Button colorScheme="teal" onClick={handleEnableExtension}>
            Enable
          </Button>
        );
      default:
        return null;
    }
  }, [extensionStatus, handleEnableExtension, handleDisableExtension]);

  const handleUninstall = useCallback(() => {
    uninstallExtension(id);
  }, [uninstallExtension, id]);

  const handleInstall = useCallback(() => {
    fetchExtension(id, displayName, contentURL, backgroundURL);
  }, [fetchExtension, id, displayName, contentURL, backgroundURL]);

  return (
    <Flex w="100%">
      <HStack>
        <Avatar name={displayName} />
        <Text>{displayName}</Text>
      </HStack>
      <Spacer />
      {hasExtension(id) ? (
        <HStack spacing="16px">
          {extensionStatusButton}
          <Button colorScheme="red" onClick={handleUninstall}>
            Uninstall
          </Button>
        </HStack>
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
