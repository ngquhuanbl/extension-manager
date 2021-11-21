interface FrameworkExtensionComponent {
  position: UIPosition;
  type: ComponentType;
  id: ExtensionComponentID;
}

type FrameworkComponent = React.ComponentType<any>;

type ComponentID = string;

type ExtensionID = string;

type ExtensionComponentID = string;

type DateTimeString = string;

type GenericFunction = (...args: any[]) => any;

type ComponentType = "COMPONENT_TYPE/TOOLBAR_ICON" | "COMPONENT_TYPE/MESSAGE";

type UIPosition = 'UI_POSITION/TOOLBAR' | 'UI_POSITION/CONTENT';
