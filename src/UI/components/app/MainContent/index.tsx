import { Box } from "@chakra-ui/react";
import React from "react";

interface Props {
  content: React.ReactNode;
}

const MainContent: React.FC<Props> = ({ content }) => {
  return (
    <Box flex="1" bg="gray.100">
      {content}
    </Box>
  );
};

export default MainContent;
