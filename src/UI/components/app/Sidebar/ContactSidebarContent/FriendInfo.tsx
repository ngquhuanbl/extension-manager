import { Flex, HStack, Spacer } from "@chakra-ui/layout";
import { Avatar, Text, Image, Spinner } from "@chakra-ui/react";
import React, { useMemo } from "react";

const FriendInfo: React.FC<FriendInfo> = ({ name, avatar, from }) => {
  const fromContent = useMemo(() => {
    if (!from) return null;
    const { id, name, avatar } = from;
    return (
      <>
        <Spacer />
        <Image
          key={id}
          boxSize="20px"
          objectFit="cover"
          src={avatar}
          alt={`from ${name}`}
          borderRadius="4px"
          fallback={
            <Spinner size="xs" emptyColor="gray.200" color="blue.500" />
          }
        />
      </>
    );
  }, [from]);
  return (
    <HStack w="100%" spacing="24px">
      <Avatar name={name} src={avatar} />
      <Flex flexGrow="1">
        <Text>{name}</Text>
        {fromContent}
      </Flex>
    </HStack>
  );
};

export default FriendInfo;
