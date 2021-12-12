import React, { useEffect } from "react";
import { useActivationMap } from "core/adapters/activation-map";

/**
 * Subscribe render method of component to a list of observer.
 * The HOCs register the render method to the observers using their subscribe methods (passed via the 2nd parameter).
 * Otherwise, to remove the registration, it uses the corresponding unsubscribe methods (passed via the 3rd parameter).
 * The 4th parameter is condition object, consumed by the observer.
 * @param WrappedComponent
 * @param subscribeFunctions
 * @param unsubscribeFunctions
 * @param conditionProps
 * @returns
 */
const withActivationEvent = <T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  eventName: EventName
) => {
  // Try to create a nice displayName for React Dev Tools.
  const displayName =
  WrappedComponent.displayName || WrappedComponent.name || "Component";


  const ComponentWithActivationEvent = (props: T) => {
    const { notifyAboutActivationEvent, notifyAboutDeactivationEvent } = useActivationMap();

    useEffect(() => {
      notifyAboutActivationEvent(eventName);
      return () => {
        notifyAboutDeactivationEvent(eventName);
      };
    }, [notifyAboutActivationEvent, notifyAboutDeactivationEvent]);

    return <WrappedComponent {...props} />;
  };

  ComponentWithActivationEvent.displayName = `withActivationEvent(${displayName})`;

  return ComponentWithActivationEvent;
};

export default withActivationEvent;
