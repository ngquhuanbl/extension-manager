import isMatch from "lodash.ismatch";

export interface Conditions {
  [key: string]: string | boolean | number | Conditions;
}

type SubscriberFunction = (...arg: any[]) => any;

export interface Subscriber<C extends Conditions> {
  conditions: C;
  subscriber: SubscriberFunction;
}

class Observer<C extends Conditions> {
  private subscribers: Array<Subscriber<C>>;

  constructor() {
    this.subscribers = [];
  }

  subscribe(newSubscriber: Subscriber<C>) {
    this.subscribers.push(newSubscriber);
    return newSubscriber;
  }

  unsubscribe(removedSubscriber: Subscriber<C>) {
    this.subscribers = this.subscribers.filter(
      (listener) => listener !== removedSubscriber
    );
  }

  notify(conditions: Conditions) {
    this.subscribers.forEach(
      ({ conditions: currentConditions, subscriber: currentSubscriber }) => {
        if (isMatch(conditions, currentConditions)) currentSubscriber();
      }
    );
  }

  notifyAll() {
    this.subscribers.forEach(({ subscriber }) => subscriber());
  }
}

export default Observer;
