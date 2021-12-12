import React, { useEffect, useReducer } from "react";

type SubscribeFunction = GenericFunction;
type UnsubscribeFunction = GenericFunction;

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
const withSubscribedRender = <T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  subscribeAndUnsubscribeFunctions: Array<
    [SubscribeFunction, UnsubscribeFunction]
  >,
  conditionProps: Array<keyof T> = []
) => {
  // Try to create a nice displayName for React Dev Tools.
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithSubscribedRender = (props: T) => {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const conditions: Partial<Record<keyof T, any>> = {};

    if (conditionProps.length !== 0) {
      conditionProps.forEach((key) => {
        if (props.hasOwnProperty(key)) conditions[key] = props[key];
      });
    }

    useEffect(() => {
      const subscriber = {
        conditions,
        subscriber: forceUpdate,
      };

      const subscribedSubscribers = subscribeAndUnsubscribeFunctions.map(
        ([subscribeFunction]) => subscribeFunction(subscriber)
      );

      return () => {
        subscribeAndUnsubscribeFunctions.forEach(
          ([ignore, unsubscribeFunction], index) =>
            unsubscribeFunction(subscribedSubscribers[index])
        );
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, Object.values(conditions));

    return <WrappedComponent {...props} />;
  };

  ComponentWithSubscribedRender.displayName = `withSubscribedRender(${displayName})`;

  return ComponentWithSubscribedRender;
};

export default withSubscribedRender;
