/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
function activate() {}

function deactivate() {}


addEventListener(
  "message",
  async function (e) {
    if (typeof e.data === "object") {
      const { type, context, data } = e.data;

      // Handle SDK Message
      if (type === "SDK_RESPONSE") {
        // const responseData = await postMessageToSDK(data);
        const responseMessage = {
          type: "BG_RESPONSE",
          context,
          data,
        };
        postMessage(responseMessage);
      }

      // Handle BG message
      if (type === "BG_REQUEST") {
        switch (context) {
          case "LOAD_BACKGROUND_SCRIPT": {
            const { endpoint } = data;
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
            // BG requests that trigger SDK requests go here
            const sdkMessage = {
              type: "SDK_REQUEST",
              context,
              data,
            };
            postMessage(sdkMessage);
          }
        }
      }
    }
  },
  false
);

