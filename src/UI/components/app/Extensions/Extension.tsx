import { Button } from "@chakra-ui/button";
import { Flex, HStack, Spacer } from "@chakra-ui/layout";
import { Avatar, Text } from "@chakra-ui/react";
import { useExtension } from "core/adapters/extensions";
import ExtensionManager from "core/domain/extension-manager";
import React, { useCallback } from "react";
import withSubscribedRender from "UI/components/HOCs/withSubscribedRender";
import { loadScript } from "UI/utils/load-scripts";

export interface Props {
  id: ExtensionID;
  displayName: string;
  content: string;
  background: string;
}

const Extension: React.FC<Props> = ({
  id,
  displayName,
  content,
  background,
}) => {
  const { hasExtension, uninstallExtension } = useExtension();

  const handleUninstall = useCallback(() => {
    uninstallExtension(id);
  }, [id, uninstallExtension]);

  const handleInstall = useCallback(() => {
    loadScript(content, { background });
  }, [background, content]);

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

export default withSubscribedRender(
  Extension,
  [
    [
      ExtensionManager.getInstance().subscribe.bind(
        ExtensionManager.getInstance()
      ),
      ExtensionManager.getInstance().unsubscribe.bind(
        ExtensionManager.getInstance()
      ),
    ],
  ],
  ["id"]
);
