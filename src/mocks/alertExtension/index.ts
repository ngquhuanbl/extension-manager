import Component from "./Component";
import { ExtensionData } from 'core/application/extension';

const extensionData: ExtensionData = {
  id: "6af24829-224c-5e03-bb9c-3cd97b24729f-alert",
  name: 'Alert',
  components: [
    {
      id: '3f820f32-8d02-5ae2-ae0d-56a89b6bc92c',
      type: 'COMPONENT_TYPE/TOOLBAR_ICON',
      component: Component,
      position: 'UI_POSITION/TOOLBAR'
    },
  ],
};

export default extensionData;
