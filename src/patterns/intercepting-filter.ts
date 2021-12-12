export type Context = any;

export abstract class Interceptor {
  abstract preProcess(context: Context): void;
  abstract postProcess(context: Context): void;
}

type Target = (...args: any[]) => any;

export class InterceptorChain {
  interceptors: Array<Interceptor> = [];
  interceptedTarget: Target | null = null;

  setTarget(rawTarget: Target) {
    let next = rawTarget;
    this.interceptors
      .slice()
      .reverse()
      .forEach((interceptor) => {
        next = this.interceptTarget(interceptor, next);
      });
    this.interceptedTarget = next;
  }

  interceptTarget(interceptor: Interceptor, target: Target) {
    return function (this: Interceptor, context: Context) {
      interceptor.preProcess(context);
      const result = target(context);
      interceptor.postProcess(context);
      return result;
    };
  }

  addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor);
  }

  execute(context: Context) {
    return this.interceptedTarget!(context);
  }
}

export default class InterceptorManager {
  interceptorChain = new InterceptorChain();

  addInterceptor(interceptor: Interceptor) {
    this.interceptorChain.addInterceptor(interceptor);
  }

  process(target: Target, context: Context) {
    this.interceptorChain.setTarget(target);

    return this.interceptorChain.execute(context);
  }
}

