import { Box } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import React, { CSSProperties } from "react";

export interface Props {
  id: string;
  isYourMessage: boolean;
  userFullname: string;
  messageContent: string;
  style?: CSSProperties;
}

const Message: React.FC<Props> = ({
  isYourMessage,
  userFullname,
  messageContent,
  style = {},
  children = (
    <>
      <Text fontSize="sm">{userFullname}</Text>
      <Text fontSize="lg">{messageContent}</Text>
    </>
  ),
}) => {
  return (
    <Box maxW="40%" alignSelf={isYourMessage ? 'flex-end' : 'flex-start'} borderRadius={2}>
      <Box
        borderRadius={2}
        padding={3}
        display="flex"
        flexDirection="column"
        bgColor="white"
        sx={style}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Message;
