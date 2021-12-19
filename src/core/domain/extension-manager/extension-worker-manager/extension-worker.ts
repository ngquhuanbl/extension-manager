/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
import { nanoid } from "nanoid";

addEventListener(
  "message",
  async function (e) {
    const { data: workerMessage } = e;
    const { type, payload } = workerMessage as WorkerMessage;

    switch (type) {
      case "LOAD_BACKGROUND_SCRIPT": {
        const { endpoint } = payload;
        importScripts(endpoint);
        break;
      }
      case "ACTIVATE": {
        (self as any).activate();
        break;
      }
      case "DEACTIVATE": {
        (self as any).deactivate();
        break;
      }
      default: {
      }
    }
  },
  false
);

// function dispatchMsgFromExtBG(data: Message) {
(self as any).dispatchMsgFromExtBG = function (data: Message) {
  const { source, meta } = data;
  const { fireAndForget } = meta;

  let processor: GenericFunction = (data: Message) => {
    postMessage(data);
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
          const { meta: resMeta, payload } = resData;
          const { messageID: resMessageID } = resMeta;

          if (resMessageID === messageID) {
            self.removeEventListener("message", listener);
            resolve(payload);
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
