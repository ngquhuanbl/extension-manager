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
