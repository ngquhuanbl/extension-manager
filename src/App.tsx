import { Flex } from "@chakra-ui/react";
import Extensions from "UI/components/app/Extensions";
import React, { useEffect, useState } from "react";
import ChatContent from "UI/components/app/ChatContent";
import {
  initDefaultUI,
  createDefineExtFunction,
  createPostMessageToBGFunction,
  installDefaultExtensions,
} from "UI/utils/init";
import Toolbar from "UI/components/app/Toolbar";
import Sidebar from "UI/components/app/Sidebar";
import MainContent from "UI/components/app/MainContent";
import { componentID as chatExtensionComponentID } from "extensions/ChatExtension";
import { componentID as extensionManagerExtensionComponentID } from "extensions/ExtensionManagerExtension";
import withActivationEvent from "UI/components/HOCs/withActivationEvent";

const views: Record<
  string,
  {
    sidebar: React.ReactNode;
    mainContent: React.ReactNode;
  }
> = {
  [chatExtensionComponentID]: {
    sidebar: null,
    mainContent: <ChatContent />,
  },
  [extensionManagerExtensionComponentID]: {
    sidebar: <Extensions />,
    mainContent: null,
  },
};

function App() {
  const [selectedToolbarItem, setSelectedToolbarItem] = useState("");
  const [sidebarContent, setSidebarContent] = useState<React.ReactNode>(null);
  const [mainContentContent, setMainContentContent] =
    useState<React.ReactNode>(null);

  useEffect(() => {
    const { sidebar, mainContent } = views[selectedToolbarItem] || {
      sidebar: null,
      mainContent: null,
    };

    // Always update sidebar content
    setSidebarContent(sidebar);

    // Only update main content when there's content
    if (mainContent) setMainContentContent(mainContent);
  }, [selectedToolbarItem]);

  useEffect(() => {
    initDefaultUI();
    createDefineExtFunction();
    createPostMessageToBGFunction();
    installDefaultExtensions();
  }, []);

  return (
    <Flex minH="100vh">
      <Toolbar
        selectedItem={selectedToolbarItem}
        onSelect={setSelectedToolbarItem}
      />
      <Sidebar content={sidebarContent} />
      <MainContent content={mainContentContent} />
    </Flex>
  );
}

export default withActivationEvent(App, "*");
