interface FrameworkExtensionComponent {
  position: UIPosition;
  type: ComponentType;
  id: ExtensionComponentID;
}

type FrameworkComponent = React.ComponentType<any>;

type FrameworkFallbackComponent =
  | boolean
  | React.ReactChild
  | React.ReactFragment
  | React.ReactPortal
  | null;

type ComponentID = string;

type ExtensionID = string;

type ExtensionComponentID = string;

type DateTimeString = string;

type GenericFunction = (...args: any[]) => any;

type ComponentType = "COMPONENT_TYPE/TOOLBAR_ICON" | "COMPONENT_TYPE/MESSAGE";

type UIPosition = "UI_POSITION/TOOLBAR" | "UI_POSITION/CONTENT";

interface Root {
  render(
    Component: React.ComponentType<any>,
    props: JSX.IntrinsicAttributes
  ): void;
  unmount(): void;
}

type EventName = string;

type Permission = "dialog" | "bluetooth" | ExtensionID;

interface ExtensionManifestData {
  displayName: string;
  name: string;
  publisher: string;
  permissions?: Array<Permission>;
  activationEvents: string[];
}

type PermissionMessage = Message & Pick<ExtensionManifestData, "permissions">;

type MESSAGE_HANDLER_KEY = "SDK" | "EXT_MANAGER";

interface ExtSourceOrTarget {
  type: "ext-bg" | "ext-content";
  value: ExtensionID;
}
type MessageSourceOrTarget = "sdk" | ExtSourceOrTarget;

interface Message {
  type: string;
  source: MessageSourceOrTarget;
  target: MessageSourceOrTarget;
  payload?: any;
  meta: {
    fireAndForget: boolean;
    messageID?: string;
    handlerKey?: string;
  };
}

interface MessageEvent {
  data: Message;
}

type ExtensionStatus = "ENABLED" | "DISABLED";

type Position = UIPosition;

type PositionComponentStatus = "ACTIVE" | "INACTIVE";

interface FriendInfo {
  id: string;
  name: string;
  avatar: string;
  from?: {
    id: string;
    name: string;
    avatar: string;
  };
}
