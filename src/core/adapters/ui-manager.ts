import { UIManagerService } from "core/application/ports";
import UIManager from 'UI/lib/ui-manager';

export const useUIManager = (): UIManagerService => {
  const instance = UIManager.getInstance();
  return {
    insertItem: instance.insertItem.bind(instance),
    removeItem: instance.removeItem.bind(instance)
  }
}