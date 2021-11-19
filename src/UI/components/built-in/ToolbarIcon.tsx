import { SearchIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import React from "react";

interface Props {
  icon?: JSX.Element;
  ariaLabel?: string;
  onClick?: () => void;
}

const ToolbarIcon: React.FC<Props> = ({ icon = <SearchIcon />, onClick, ariaLabel="" }) => {
  return (
    <IconButton
      colorScheme="blue"
      aria-label={ariaLabel}
      icon={icon}
      size="lg"
      onClick={onClick}
    />
  );
};

export default ToolbarIcon;
