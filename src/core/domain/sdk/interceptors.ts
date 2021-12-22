import { Interceptor } from "patterns/intercepting-filter";

export class DialogPermissionInterceptor extends Interceptor {
  preProcess(message: PermissionMessage) {
    const { permissions } = message;

    if (permissions && permissions.includes("dialog")) return;

    throw new Error("Disallowed use of dialog API");
  }

  postProcess() {}
}
