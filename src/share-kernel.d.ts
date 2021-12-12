interface FrameworkExtensionComponent {
  position: UIPosition;
  type: ComponentType;
  id: ExtensionComponentID;
}

type FrameworkComponent = React.ComponentType<any>;

type FrameworkFallbackComponent =  boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null;

type ComponentID = string;

type ExtensionID = string;

type ExtensionComponentID = string;

type DateTimeString = string;

type GenericFunction = (...args: any[]) => any;

type ComponentType = "COMPONENT_TYPE/TOOLBAR_ICON" | "COMPONENT_TYPE/MESSAGE";

type UIPosition = 'UI_POSITION/TOOLBAR' | 'UI_POSITION/CONTENT';

interface Root {
  render(
    Component: React.ComponentType<any>,
    props: JSX.IntrinsicAttributes
  ): void;
  unmount(): void;
}

interface WorkerMessage {
  type: 'BG_REQUEST' | 'BG_RESPONSE' | 'SDK_REQUEST' | 'SDK_RESPONSE',
  context: string;
  messageData?: any;
  manifestData?: ManifestData;
}

type WorkerMessageFromContentScript = Pick<WorkerMessage, 'context' | 'messageData'>;

type EventName = string;

type Permission = 'dialog' | 'bluetooth';

interface ManifestData {
  name: string;
  publisher: string;
  permissions: Array<Permission>;
}

type SDKMessage = Pick<WorkerMessage, 'context' | 'manifestData' | 'messageData'>