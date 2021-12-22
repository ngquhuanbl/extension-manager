/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
import { nanoid } from "nanoid";

addEventListener(
  "message",
  async function (e: { data: Message }) {
    const { data } = e;
    const { type, payload } = data;

    switch (type) {
      case "LOAD_BACKGROUND_SCRIPT": {
        const { endpoint } = payload;
        importScripts(endpoint);
        (self as any).postCorrespondingResponse(data);
        break;
      }
      case "ACTIVATE": {
        await (self as any).activate();
        (self as any).postCorrespondingResponse(data);
        break;
      }
      case "DEACTIVATE": {
        await (self as any).deactivate();
        (self as any).postCorrespondingResponse(data);
        break;
      }
      default: {
      }
    }
  },
  false
);

(self as any).postCorrespondingResponse = function (data: Message) {
  const { type, source: requestSource, target: requestTarget } = data;
  const responseType = `${type}_RESPONSE`;

  const responseMessage = {
    ...data,
    type: responseType,
    source: requestTarget,
    target: requestSource,
  };
  (self as any).postMessage(responseMessage);
};

(self as any).dispatchMsgFromExtBG = function (data: Message) {
  const { source, meta, type: requestType } = data;
  const { fireAndForget } = meta;

  let processor: GenericFunction = (data: Message) => {
    return Promise.resolve(postMessage(data));
  };

  try {
    if (fireAndForget) {
      processor(data);
    } else {
      return new Promise((resolve) => {
        const messageID = nanoid();
        data.meta.messageID = messageID;

        const listener = (event: any) => {
          const { data: resData } = event;
          const { type: responseType, meta: resMeta, payload } = resData;
          const { messageID: resMessageID } = resMeta;

          if (responseType === `${requestType}_RESPONSE`) {
            if (resMessageID === messageID) {
              self.removeEventListener("message", listener);
              resolve(payload);
            }
          }
        };
        self.addEventListener("message", listener);

        processor(data);
      });
    }
  } catch (e: any) {
    const { message } = e;
    console.log(`ERROR: BG script | Ext ID: ${source} | Error msg: ${message}`);
  }
};

export {};
