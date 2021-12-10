import { Flex, Box } from "@chakra-ui/react";
import Extensions from "UI/components/app/Extensions";
import { useEffect } from "react";
import ChatContent from "UI/components/app/ChatContent";
import ComponentList from "UI/components/app/ComponentList";
import {
  initDefaultUI,
  createDefineExtFunction,
  createPostMessageToBGFunction,
} from "UI/utils/init";

function App() {
  useEffect(() => {
    initDefaultUI();
    createDefineExtFunction();
    createPostMessageToBGFunction();
  }, []);

  return (
    <Flex minH="100vh">
      <Flex
        w="70px"
        bg="blue.500"
        paddingTop={4}
        flexDirection="column"
        alignItems="center"
        sx={{
          "& > *": {
            marginBottom: "16px",
          },
        }}
      >
        <div>
          <ComponentList
            position="UI_POSITION/TOOLBAR"
            componentType="COMPONENT_TYPE/TOOLBAR_ICON"
          />
        </div>
      </Flex>
      <Box w="500px" borderRight="1px" borderRightColor="gray.200">
        <Extensions />
      </Box>
      <Box flex="1" bg="gray.100">
        <ChatContent />
      </Box>
    </Flex>
  );
}

export default App;
