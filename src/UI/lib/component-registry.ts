type Component = React.ComponentType<any>;
interface ComponentData {
  id: ComponentID;
  component: Component;
}

type RegisterID = ComponentType;
interface Register {
  id: RegisterID;
  components: Map<ComponentID, ComponentData>;
};
type Registry = Map<RegisterID, Register>;

/**
 * A registry used to store component
 */
class ComponentRegistry {
  static instance: ComponentRegistry | null = null;
  private registry: Registry;

  private constructor() {
    this.registry = new Map();
  }

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ComponentRegistry();
    }
    return this.instance;
  }

  /**
   * Register a component into the registry
   * @param registerID The register ID
   * @param componentID The component ID
   * @param component The component element
   */
  registerComponent(
    registerID: ComponentType,
    componentID: ComponentID,
    component: Component
  ) {
    const register: Register = this.registry.get(registerID) || {
      id: registerID,
      components: new Map()
    };

    const { components } = register;

    const componentData  = {
      id: componentID,
      component
    };
    components.set(componentID, componentData);

    this.registry.set(registerID, register);
  }

  /**
   * Cancel registration of a component in the registry
   * @param registerID The register ID
   * @param componentID The component ID
   * @param component The component element
   */
  removeComponent(registerID: ComponentType, componentID: ComponentID) {
    const register = this.registry.get(registerID);

    if (!register) return;

    const { components } = register;

    components.delete(componentID);

    this.registry.set(registerID, register);
  }

  /**
   * Get a component
   * @param registerID The register ID
   * @param componentID The component ID
   * @returns The component corresponding with given component type string and component ID (if existed), otherwise null
   */
  getComponentData(registerID: ComponentType, componentID: ComponentID) {
    const register = this.registry.get(registerID);

    if (!register) return null;

    const { components } = register;

    const Component = components.get(componentID);

    return Component || null;
  }
}

export default ComponentRegistry;
