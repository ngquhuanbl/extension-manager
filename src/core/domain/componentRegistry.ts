export const COMPONENT_TYPE_TOOLBAR_ICON = "COMPONENT_TYPE/TOOLBAR_ICON";
export const COMPONENT_TYPE_MESSAGE = "COMPONENT_TYPE/MESSAGE";

export type ComponentType =
  | typeof COMPONENT_TYPE_TOOLBAR_ICON
  | typeof COMPONENT_TYPE_MESSAGE;

export interface ComponentData {
  id: string;
  type: ComponentType;
  component: FrameworkComponent;
}

/**
 * Manage components by their component type
 */
class ComponentRegistry {
  static instance: ComponentRegistry | null = null;
  private components: Map<ComponentType, Map<ComponentID, ComponentData>>;

  private constructor() {
    this.components = new Map();
  }

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ComponentRegistry();
    }
    return this.instance;
  }

  /**
   * Register a component into the registry using its ID and component type string
   * @param type The component type string
   * @param id The component ID
   * @param component The component element
   */
  registerComponent(
    type: ComponentType,
    id: ComponentID,
    component: React.ComponentType<any>
  ) {
    const componentMap = this.components.get(type) || new Map();
    componentMap.set(id, { id, type, component });
    this.components.set(type, componentMap);
  }

  /**
   * Cancel registration of a component in the registry using its ID and component type string
   * @param type The component type string
   * @param id The component ID
   * @param component The component element
   */
  removeComponent(type: ComponentType, id: ComponentID) {
    const componentMap = this.components.get(type) || new Map();
    componentMap.delete(id);
    this.components.set(type, componentMap);
  }

  /**
   * Get a component by their component type string and ID
   * @param type Component string
   * @param id Component ID
   * @param childrenProps Component props
   * @returns The component corresponding with given component type string and component ID (if existed), otherwise null
   */
  getComponentData(type: ComponentType, id: ComponentID) {
    const Component = this.components.get(type)?.get(id);

    return Component || null;
  }
}

export default ComponentRegistry;
