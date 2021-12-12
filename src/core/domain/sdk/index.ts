import InterceptorManager, { Interceptor } from "patterns/intercepting-filter";
import { DialogPermissionInterceptor } from "./interceptors";

const INTERCEPTORS: Record<string, Interceptor> = {
  dialog: new DialogPermissionInterceptor(),
};

const TARGETS: Record<string, GenericFunction> = {
  "window.dialog.showMessageBox": async (sdkMessage: SDKMessage) => {
    const { messageData } = sdkMessage;

    const res = await window.dialog.showMessageBox(messageData);
    return res;
  },
  "window.dialog.showMessageBoxSync": (sdkMessage: SDKMessage) => {
    const { messageData } = sdkMessage;
    window.dialog.showMessageBoxSync(messageData);
  },
};

class SDK {
  private static instance: SDK | null = null;

  static getInstance() {
    if (this.instance === null) {
      this.instance = new SDK();
    }
    return this.instance;
  }

  async process(sdkMessage: SDKMessage) {
    const { context } = sdkMessage;

    const target = TARGETS[context];

    const interceptors = this.getInterceptors(context);

    const processor = new InterceptorManager();

    interceptors.forEach((interceptor) => {
      processor.addInterceptor(interceptor);
    });

    const targetArguments = sdkMessage;

    const res = await processor.process(target, targetArguments);
    return res;
  }

  getInterceptors(messageContext: string) {
    let permissions = messageContext.split(".");

    // Remove global object
    permissions = permissions.filter((permission) => permission !== "window");
    // Remove method name
    if (permissions.length > 1) permissions.pop();

    return permissions.map((permission) => INTERCEPTORS[permission]);
  }
}

export default SDK;
