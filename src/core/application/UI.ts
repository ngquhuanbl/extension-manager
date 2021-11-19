import ComponentRegistry, {
  ComponentData,
  ComponentType,
} from "core/domain/componentRegistry";
import UIManager, { UIPosition } from "core/domain/UIManager";
export const getRegisteredComponentDataList = (
  position: UIPosition,
  componentType: ComponentType
) => {
  const componentList =
    UIManager.getInstance().getComponentIDsByPosition(position) || [];
  const content = componentList
    .map((id) =>
      ComponentRegistry.getInstance().getComponentData(componentType, id)
    )
    .filter((componentData) => componentData !== null) as Array<
    NonNullable<ComponentData>
  >;
  return content;
};
