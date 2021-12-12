/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
function activate() {}

function deactivate() {}


addEventListener(
  "message",
  async function (e) {
    if (typeof e.data === "object") {
      const { data: workerMessage } = e;
      const { type, context, messageData } = workerMessage as WorkerMessage;

      // FLOW 1: BACKGROUND <-> WORKER
      if (type === "BG_REQUEST") {
        switch (context) {
          case "LOAD_BACKGROUND_SCRIPT": {
            const { endpoint } = messageData;
            importScripts(endpoint);
            break;
          }
          case "ACTIVATE": {
            activate();
            break;
          }
          case "DEACTIVATE": {
            deactivate();
            break;
          }
          default: {
            // Requests of other contexts (which are received from background) will be fowarded to SDK
            const sdkMessage = {
              ...workerMessage,
              type: "SDK_REQUEST",
            };
            postMessage(sdkMessage);
          }
        }
        return;
      }

      // FLOW 2: WORKER <-> SDK
      if (type === "SDK_RESPONSE") {
        // Requests received from SDK will be fowarded to background
        const responseMessage = {
          ...workerMessage,
          type: "BG_RESPONSE",
        };
        postMessage(responseMessage);
        return;
      }
    }
  },
  false
);

export {}