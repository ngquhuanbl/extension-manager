import { VStack, Center, Spinner } from "@chakra-ui/react";
import FriendlistManager from "core/domain/sdk/friendlist-manager";
import React, { useEffect, useState } from "react";
import withActivationEvent from "UI/components/HOCs/withActivationEvent";
import withSubscribedRender from "UI/components/HOCs/withSubscribedRender";
import FriendInfoItem from "./FriendInfo";

const ContactSidebarContent: React.FC = () => {
  const [data, setData] = useState<Array<FriendInfo>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const friendlistManager = FriendlistManager.getInstance();
      const res = await friendlistManager.getData();
      setData(res);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <Center h="100px">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
        />
      </Center>
    );

  return (
    <VStack spacing="24px" padding="16px" maxHeight="100vh" overflow="auto">
      {data.map((item) => (
        <FriendInfoItem key={item.id} {...item} />
      ))}
    </VStack>
  );
};

export default withSubscribedRender(
  withActivationEvent(ContactSidebarContent, "onView:contactSidebarContent"),
  [
    [
      FriendlistManager.getInstance().subscribe.bind(
        FriendlistManager.getInstance()
      ),
      FriendlistManager.getInstance().unsubscribe.bind(
        FriendlistManager.getInstance()
      ),
    ],
  ]
);
