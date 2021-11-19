import ComponentRegistry from "core/domain/componentRegistry";
import UIManager from "core/domain/UIManager";
import BuiltInMessage from 'UI/components/built-in/Message';

export const initDefaultUI = () => {
    const builtInMessageID = "0b16542f-db1a-52d3-94d2-1bb828e42c40";
    ComponentRegistry.getInstance().registerComponent(
      "COMPONENT_TYPE/MESSAGE",
      builtInMessageID,
      BuiltInMessage
    );

    UIManager.getInstance().insertItem('UI_POSITION/CONTENT', builtInMessageID);
}