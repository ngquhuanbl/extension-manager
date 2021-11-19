type Subscriber = (...arg: any[]) => any;
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

  notify() {
    this.subscribers.forEach((subscriber) => subscriber());
  }
}

export default Observer;