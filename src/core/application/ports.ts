// Ports defines the interfaces used by the application layer to connect to external services/frameworks
// The ports implementation will be specified in the adapter layer

export interface ComponentRegistryService {
  registerComponent(
    componentType: ComponentType,
    componentID: ComponentID,
    component: FrameworkComponent
  ): void;
  registerComponentUsingGetter(
    componentType: ComponentType,
    componentID: ComponentID,
    component: FrameworkComponent,
    fallback?: FrameworkFallbackComponent
  ): void;
  removeComponent(componentType: ComponentType, componentID: string): void;
}

export interface UIManagerService {
  insertItem(position: UIPosition, componentID: ComponentID, initialStatus?: PositionComponentStatus): void;
  removeItem(position: UIPosition, componentID: ComponentID): void;
  setComponentStatus(position: Position, componentID: ComponentID, status: PositionComponentStatus): void;
}
