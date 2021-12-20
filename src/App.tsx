import { Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  createDefineExtFunction,
  createDispatchMsgFromExtContentFunction,
  createDispatchMsgFromSDKFunction,
  installPersistedExtensions,
} from "UI/utils/init";
import Toolbar from "UI/components/app/Toolbar";
import Sidebar from "UI/components/app/Sidebar";
import ExtensionManagerSidebarContent from "UI/components/app/Sidebar/ExtensionManagerSidebarContent";
import ContactSidebarContent from "UI/components/app/Sidebar/ContactSidebarContent";
import MainContent from "UI/components/app/MainContent";
import ChatContent from "UI/components/app/MainContent/ChatContent";
import { componentID as chatExtensionComponentID } from "UI/components/app/Toolbar/ChatToolbarIcon";
import { componentID as contactExtensionComponentID } from "UI/components/app/Toolbar/ContactToolbarIcon";
import { componentID as extensionManagerExtensionComponentID } from "UI/components/app/Toolbar/ExtensionManagerToolbarIcon";
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
  [contactExtensionComponentID]: {
    sidebar: <ContactSidebarContent />,
    mainContent: null,
  },
  [extensionManagerExtensionComponentID]: {
    sidebar: <ExtensionManagerSidebarContent />,
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
    createDefineExtFunction();
    createDispatchMsgFromExtContentFunction();
    createDispatchMsgFromSDKFunction();
    installPersistedExtensions();
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
