/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { useRef, useLayoutEffect } from "react";

const withLazyLegacyRoot = (
  getLegacyComponent: () => Promise<{ default: FrameworkComponent }>,
  createLegacyRoot: (container: Element | DocumentFragment) => Root
) => {
  let componentModule = {
    status: "pending",
    promise: null,
    result: null,
  };

  return function Wrapper(props: any) {
    const Component = readModule(componentModule, getLegacyComponent).default;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<Root | null>(null);

    // Create/unmount.
    useLayoutEffect(() => {
      if (!rootRef.current) {
        rootRef.current = createLegacyRoot(containerRef.current!);
      }
      const root = rootRef.current;
      return () => {
        root.unmount();
      };
    }, []);

    // Mount/update.
    useLayoutEffect(() => {
      if (rootRef.current) {
        rootRef.current.render(Component, props);
      }
    }, [Component, props]);

    return <div style={{ display: "contents" }} ref={containerRef} />;
  };
}

// This is similar to React.lazy, but implemented manually.
// We use this to Suspend rendering of this component until
// we fetch the component and the legacy React to render it.
function readModule(
  record: { status: any; promise: any; result: any },
  createPromise: () => Promise<any>
) {
  if (record.status === "fulfilled") {
    return record.result;
  }
  if (record.status === "rejected") {
    throw record.result;
  }
  if (!record.promise) {
    record.promise = createPromise().then(
      (value) => {
        if (record.status === "pending") {
          record.status = "fulfilled";
          record.promise = null;
          record.result = value;
        }
      },
      (error) => {
        if (record.status === "pending") {
          record.status = "rejected";
          record.promise = null;
          record.result = error;
        }
      }
    );
  }
  throw record.promise;
}

export default withLazyLegacyRoot;
