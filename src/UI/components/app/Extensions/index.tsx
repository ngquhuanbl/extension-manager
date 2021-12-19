import { VStack, Center, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { createAPIPath } from "UI/utils/api";
import Extension, { Props as Data } from "./Extension";

const Extensions: React.FC = () => {
  const [data, setData] = useState<Array<Data>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(createAPIPath('/extensions/all'));
      const parsedRes = await res.json();
      const { extensions } = parsedRes;
      setData(extensions);
      setLoading(false);
    }
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
    <VStack spacing="24px" padding="16px">
      {data.map((item) => (
        <Extension key={item.id} {...item} />
      ))}
    </VStack>
  );
};

export default Extensions;
