import { useCallback } from "react";
import BuiltInToolbarIcon from "UI/components/built-in/ToolbarIcon"; // expose for development
import { BellIcon } from '@chakra-ui/icons';

const Component = () => {
  const handleClick = useCallback(() => {
    window.dialog.showMessageBox({
      message: "This is an alert!",
      type: "info",
    });
  }, []);

  return (
    <BuiltInToolbarIcon
      ariaLabel="Alert"
      onClick={handleClick}
      icon={
        <BellIcon />
      }
    />
  );
};

export default Component;
