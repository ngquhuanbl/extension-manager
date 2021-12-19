import { createStandaloneToast } from "@chakra-ui/react";
import { nanoid } from "nanoid";

const toast = createStandaloneToast();

export const EXT_MSG_EVENT_TYPE = "EXT_MSG";

const MESSAGE_QUEUE_INTERVAL = 200;

class MessageManager {
  private messageQueue: Array<Message> = [];
  private isHandlingMessage = false;
  private static instance: MessageManager | null = null;

  private handlers = new Map<string, GenericFunction>();

  static getInstance() {
    if (this.instance === null) {
      this.instance = new MessageManager();
    }
    return this.instance;
  }

  constructor() {
    // Set up interval for handling message queue
    setInterval(async () => {
      if (!this.isHandlingMessage && this.messageQueue.length !== 0) {
        const message = this.messageQueue.shift()!;

        try {
          const res = await this.handleMessage(message);

          // Return the result to the message sender
          const { meta } = message;
          const { fireAndForget } = meta;
          if (!fireAndForget) {
            const resMessage: Message = {
              ...message,
              payload: res,
            };

            const customEvent = new CustomEvent(EXT_MSG_EVENT_TYPE, {
              detail: resMessage,
            });
            window.dispatchEvent(customEvent);
          }
        } catch (e: any) {
          const { message } = e;
          toast({
            title: message,
            status: "error",
            isClosable: true,
          });
        }
      }
    }, MESSAGE_QUEUE_INTERVAL);
  }

  enqueueMessage(data: Message) {
    this.messageQueue.push(data);
  }

  async handleMessage(data: Message) {
    // TODO: PICK THE RIGHT HANDLER FOR THE MESSAGE
    const { meta } = data;
    const { handlerKey } = meta;

    if (!handlerKey) throw new Error(`No handler key found`);

    const handlerFunc = this.handlers.get(handlerKey);

    if (!handlerFunc)
      throw new Error(
        `No message handler found for handler key of value ${handlerKey}`
      );

    const res = handlerFunc(data);

    return res;
  }

  createReq(data: Message) {
    const messageID = nanoid();
    return {
      ...data,
      meta: {
        messageID,
      },
      result: new Promise((resolve) => {
        const listener = (event: any) => {
          const { detail: resData } = event;
          const { meta: resMeta, payload } = resData;
          const { messageID: resMessageID } = resMeta;

          if (resMessageID === messageID) {
            window.removeEventListener(EXT_MSG_EVENT_TYPE, listener);
            resolve(payload);
          }
        };
        window.addEventListener(EXT_MSG_EVENT_TYPE, listener);
      }),
    };
  }

  registerMessageHandler(handlerKey: string, handlerFunc: GenericFunction) {
    this.handlers.set(handlerKey, handlerFunc);
  }
}

export default MessageManager;
