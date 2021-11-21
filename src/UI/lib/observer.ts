import isMatch from "lodash.ismatch";

export interface Conditions {
  [key: string]: string | boolean | number | Conditions;
}

type SubscriberFunction = (...arg: any[]) => any;

export interface Subscriber {
  conditions: Conditions;
  subscriber: SubscriberFunction;
}

class Observer {
  private subscribers: Array<Subscriber>;

  constructor() {
    this.subscribers = [];
  }

  subscribe(newSubscriber: Subscriber) {
    this.subscribers.push(newSubscriber);
  }

  unsubscribe(removedSubscriber: Subscriber) {
    this.subscribers = this.subscribers.filter(
      (listener) => listener !== removedSubscriber
    );
  }

  notify(conditions: Conditions) {
    this.subscribers.forEach(({ conditions: currentConditions, subscriber: currentSubscriber }) => {
      if (isMatch(conditions, currentConditions)) currentSubscriber();
    });
  }

  notifyAll() {
    this.subscribers.forEach(({ subscriber }) => subscriber());
  }
}

export default Observer;
