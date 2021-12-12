import {
  notifyAboutActivationEvent,
  notifyAboutDeactivationEvent,
  subscribeToActivationEvent,
  subscribeToDeactivationEvent,
  unsubscribeToEvent,
} from "core/application/activation-map";

export const useActivationMap = () => {
  return {
    subscribeToActivationEvent,
    subscribeToDeactivationEvent,
    unsubscribeToEvent,
    notifyAboutActivationEvent,
    notifyAboutDeactivationEvent
  };
};
