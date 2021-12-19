import MessageManager from '../domain/message-manager';

export const createReq = MessageManager.getInstance().createReq.bind(MessageManager.getInstance());



