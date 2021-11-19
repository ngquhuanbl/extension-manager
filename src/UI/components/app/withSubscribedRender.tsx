import React, { useEffect, useReducer } from "react";

const withSubscribedRender = <T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  subscribeFunctions: Array<GenericFunction>,
  unsubscribeFunctions: Array<GenericFunction>
) => {
  // Try to create a nice displayName for React Dev Tools.
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithSubscribedRender = (props: T) => {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useEffect(() => {
      subscribeFunctions.forEach((subscribeFunction) => subscribeFunction(forceUpdate));
      return () => {
        unsubscribeFunctions.forEach((unsubscribeFunction) => unsubscribeFunction(forceUpdate));
      };
    }, []);

    return <WrappedComponent {...props} />;
  };

  ComponentWithSubscribedRender.displayName = `withSubscribedRender(${displayName})`;

  return ComponentWithSubscribedRender;
};

export default withSubscribedRender;
