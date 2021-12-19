import React, { FormEvent, useCallback } from "react";
import { Props as MessageData } from "UI/components/built-in/Message";
import { nanoid } from "nanoid";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Box, Flex } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { Select } from "@chakra-ui/select";

interface Props {
  onAddMessage: (message: MessageData) => void;
}

const ChatBox: React.FC<Props> = ({ onAddMessage }) => {
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const currentTarget = e.currentTarget as typeof e.currentTarget & {
        messageContent: { value: string };
        role: { value: string };
      };

      const id = nanoid();
      const messageContent = currentTarget.messageContent.value;
      const role = currentTarget.role.value;
      const isYourMessage = role === "Current user";

      if (messageContent === "") return;

      onAddMessage({
        id,
        userFullname: role,
        messageContent,
        isYourMessage,
      });

      currentTarget.messageContent.value = "";
    },
    [onAddMessage]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Flex
        direction="column"
        padding={4}
        bgColor="white"
        h="180px"
      >
        <Box marginBottom={3} h="64px">
          <FormControl id="role">
            <FormLabel flexShrink="0" margin="0" marginRight={4}>
              Send message as:{" "}
            </FormLabel>
            <Select w="fit-content" defaultValue="Current user">
              <option>Current user</option>
              <option>Opponent</option>
            </Select>
          </FormControl>
        </Box>
        <Box h="72px">
          <FormControl id="messageContent">
            <FormLabel>Message:</FormLabel>
            <Input type="text" />
          </FormControl>
        </Box>
      </Flex>
    </form>
  );
};

export default ChatBox;
