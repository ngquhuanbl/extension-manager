import React, { Suspense } from "react";

interface ComponentData {
  id: ComponentID;
  component: FrameworkComponent;
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
   * @param componentType The register ID
   * @param componentID The component ID
   * @param component The component element
   */
  registerComponent(
    componentType: ComponentType,
    componentID: ComponentID,
    component: FrameworkComponent
  ) {
    const register: Register = this.registry.get(componentType) || {
      id: componentType,
      components: new Map()
    };

    const { components } = register;

    const componentData  = {
      id: componentID,
      component
    };
    components.set(componentID, componentData);

    this.registry.set(componentType, register);
  }

  /**
   * Register a component into the registry
   * @param componentType The register ID
   * @param componentID The component ID
   * @param component The component element
   */
  async registerComponentUsingGetter(
    componentType: ComponentType,
    componentID: ComponentID,
    LazyComponent: FrameworkComponent,
    fallback: FrameworkFallbackComponent = false
  ) {
    const register: Register = this.registry.get(componentType) || {
      id: componentType,
      components: new Map()
    };

    const { components: componentMap } = register;


    const LazyComponentWithSuspense = () => (
      <Suspense fallback={fallback}>
        <LazyComponent />
      </Suspense>
    )

    const componentData  = {
      id: componentID,
      component: LazyComponentWithSuspense
    };
    componentMap.set(componentID, componentData);

    this.registry.set(componentType, register);
  }

  /**
   * Cancel registration of a component in the registry
   * @param componentType The register ID
   * @param componentID The component ID
   * @param component The component element
   */
  removeComponent(componentType: ComponentType, componentID: ComponentID) {
    const register = this.registry.get(componentType);

    if (!register) return;

    const { components } = register;

    components.delete(componentID);

    this.registry.set(componentType, register);
  }

  /**
   * Get a component
   * @param componentType The register ID
   * @param componentID The component ID
   * @returns The component corresponding with given component type string and component ID (if existed), otherwise null
   */
  getComponentData(componentType: ComponentType, componentID: ComponentID) {
    const register = this.registry.get(componentType);

    if (!register) return null;

    const { components } = register;

    const Component = components.get(componentID);

    return Component || null;
  }
}

export default ComponentRegistry;
