import React, { useEffect, useReducer } from "react";

const withSubscribedRender = <T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  subscribeFunctions: Array<GenericFunction>,
  unsubscribeFunctions: Array<GenericFunction>,
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
        subscriber: forceUpdate
      };

      subscribeFunctions.forEach((subscribeFunction) =>
        subscribeFunction(subscriber)
      );

      return () => {
        unsubscribeFunctions.forEach((unsubscribeFunction) =>
          unsubscribeFunction(subscriber)
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
