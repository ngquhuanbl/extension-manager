import ActivationMap from "core/domain/activation-map";

const activationMap = ActivationMap.getInstance();

export const subscribeToActivationEvent = activationMap.subscribeToActivationEvent.bind(activationMap);

export const subscribeToDeactivationEvent = activationMap.subscribeToDeactivationEvent.bind(activationMap);

export const unsubscribeToEvent = activationMap.unsubscribeToEvent.bind(activationMap);

export const notifyAboutActivationEvent = activationMap.notifyAboutActivation.bind(activationMap);

export const notifyAboutDeactivationEvent = activationMap.notifyAboutDeactivation.bind(activationMap);