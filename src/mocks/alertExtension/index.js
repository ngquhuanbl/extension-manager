import { COMPONENT_TYPE_TOOLBAR_ICON } from 'core/domain/componentRegistry';
import { UI_POSITION_TOOLBAR } from 'core/domain/UIManager';
import Component from "./Component";

const extensionData = {
  id: "6af24829-224c-5e03-bb9c-3cd97b24729f-alert",
  components: [
    {
      type: COMPONENT_TYPE_TOOLBAR_ICON,
      component: Component,
      position: UI_POSITION_TOOLBAR
    },
  ],
};

export default extensionData;
