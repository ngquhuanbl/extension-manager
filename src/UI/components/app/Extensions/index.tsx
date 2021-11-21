import { Grid } from "@chakra-ui/react";
import React from "react";
import AlertExtension from "./AlertExtension";
import IUMExtension from "./IUMExtension";

interface Props {}

const Extensions: React.FC<Props> = (props) => {
  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={2} padding={4}>
      <AlertExtension />
      <IUMExtension />
    </Grid>
  );
};

export default Extensions;

// export default withSubscribedRender(Extensions, [
//   ExtensionManager.getInstance().addExtension.bind(ExtensionManager.getInstance())
// ],[
//   ExtensionManager.getInstance().removeExtension.bind(ExtensionManager.getInstance())
// ])

