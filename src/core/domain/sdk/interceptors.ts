import { Interceptor } from "patterns/intercepting-filter";

export class DialogPermissionInterceptor extends Interceptor {
  preProcess(sdkMessage: SDKMessage) {
    const { permissions } = sdkMessage;

    if (permissions && permissions.includes("dialog")) return;

    throw new Error("Disallowed use of dialog API");
  }

  postProcess() {}
}
