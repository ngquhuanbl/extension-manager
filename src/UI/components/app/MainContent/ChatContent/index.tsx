import { Box, Flex } from "@chakra-ui/layout";
import React, { useCallback, useEffect, useRef, useState } from "react";
import SingleItem from "UI/components/app/SingleItem";
import { Props as MessageData } from "UI/components/built-in/Message";
import withActivationEvent from "UI/components/HOCs/withActivationEvent";
import ComponentRegistry from "UI/lib/component-registry";
import UIManager from "UI/lib/ui-manager";
import ChatBox from "./ChatBox";
import BuiltInMessage from "UI/components/built-in/Message";

const ChatContent = () => {
  const [messages, setMessages] = useState<Array<MessageData>>([]);
  const ref = useRef<HTMLDivElement>(null);

  const handleAddMessage = useCallback((message) => {
    setMessages((prevState) => [...prevState, message]);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const builtInMessageID = "0b16542f-db1a-52d3-94d2-1bb828e42c40";
    ComponentRegistry.getInstance().registerComponent(
      "COMPONENT_TYPE/MESSAGE",
      builtInMessageID,
      BuiltInMessage
    );

    UIManager.getInstance().insertItem("UI_POSITION/CONTENT", builtInMessageID);
  }, [])

  return (
    <Flex direction="column">
      <Flex
        ref={ref}
        h="calc(100vh - 180px)"
        direction="column"
        justify="flex-end"
        padding={4}
        overflow="auto"
        sx={{
          "& > *": {
            marginBottom: "12px",
          },
        }}
      >
        {messages.map((message) => (
          <SingleItem
            key={message.id}
            componentType="COMPONENT_TYPE/MESSAGE"
            position="UI_POSITION/CONTENT"
            childrenProps={message}
          />
        ))}
      </Flex>
      <Box w="100%">
        <ChatBox onAddMessage={handleAddMessage} />
      </Box>
    </Flex>
  );
};

export default withActivationEvent(ChatContent, 'onView:chatContent');
