import { Box } from "@chakra-ui/layout";
import React from "react";

interface Props {
  content: React.ReactNode;
}

const Sidebar: React.FC<Props> = ({ content }) => {
  return (
    <Box w="500px" borderRight="1px" borderRightColor="gray.200">
      {content}
    </Box>
  );
};

export default Sidebar;
