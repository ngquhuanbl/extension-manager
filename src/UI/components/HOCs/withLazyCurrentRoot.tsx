/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

const withLazyCurrentRoot = (
  getLegacyComponent: () => Promise<{ default: FrameworkComponent }>
) => {
  let componentModule = {
    status: "pending",
    promise: null,
    result: null,
  };

  return function Wrapper(props: any) {
    const Component = readModule(componentModule, getLegacyComponent).default;

    return <Component />;
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

export default withLazyCurrentRoot;
