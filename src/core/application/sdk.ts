import SDK from "core/domain/sdk";

export const dispatchMsgFromExtContentToSDK =
  SDK.getInstance().dispatchMsgFromExtContentToSDK.bind(
    SDK.getInstance()
  );