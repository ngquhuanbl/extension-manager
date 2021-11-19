import React, { useCallback, useState } from "react";
import BuiltInMessage from "UI/components/built-in/Message";
import { Text, Image, IconButton } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

const Component = ({ id, isYourMessage, userFullname, messageContent }) => {
  const [file, setFile] = useState(null);
  const handleClick = useCallback(async () => {
    const { filePaths } = await window.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Image file",
          extensions: ["jpg", "jpeg", "png", "gif"],
        },
      ],
    });

    if (filePaths.length === 0) return;
    setFile(`file://${filePaths[0]}`);
  }, []);

  return (
    <BuiltInMessage
      isYourMessage={isYourMessage}
      userFullname={userFullname}
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Text fontSize="sm">{userFullname}</Text>
      <Text fontSize="lg">{messageContent}</Text>
      {file && (
        <Image src={file} mt={2} h="max-content" maxH="400px" w="auto" />
      )}
      <IconButton icon={<AddIcon />} mt={2} onClick={handleClick} w="min-content" />
    </BuiltInMessage>
  );
};

export default Component;
