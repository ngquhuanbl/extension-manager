import { ComponentRegistryService } from 'core/application/ports';
import ComponentRegistry from 'UI/lib/component-registry';

export const useComponentRegistry = (): ComponentRegistryService => {
  const instance = ComponentRegistry.getInstance();
  return {
    registerComponent: instance.registerComponent.bind(instance),
    registerComponentUsingGetter: instance.registerComponentUsingGetter.bind(instance),
    removeComponent: instance.removeComponent.bind(instance)
  }
}