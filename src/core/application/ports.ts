// Ports defines the interfaces used by the application layer to connect to external services/frameworks
// The ports implementation will be specified in the adapter layer

export interface APIService {
  get: (...args: any[]) => Promise<any>;
}

export interface ComponentRegistryService {
  registerComponent(
    componentType: ComponentType,
    componentID: ComponentID,
    component: FrameworkComponent
  ): void;
  removeComponent(componentType: ComponentType, componentID: string): void;
}

export interface UIManagerService {
  insertItem(position: UIPosition, componentID: ComponentID): void;
  removeItem(position: UIPosition, componentID: ComponentID): void;
}
