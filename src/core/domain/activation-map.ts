import ObserverWithConditions, {
  Conditions,
  Subscriber,
} from "../../patterns/observer";

export const EVENT_STATUS_ACTIVE = "ACTIVE";
export const EVENT_STATUS_INACTIVE = "INACTIVE";

type EventStatus = typeof EVENT_STATUS_ACTIVE | typeof EVENT_STATUS_INACTIVE;

export interface EventConditions extends Conditions {
  status: EventStatus;
  eventName: EventName;
}

class ActivationMap extends ObserverWithConditions<EventConditions> {
  private static instance: ActivationMap | null = null;

  private eventStatusTracking: Map<EventName, EventStatus> = new Map();

  static getInstance() {
    if (this.instance === null) {
      this.instance = new ActivationMap();
    }
    return this.instance;
  }

  getEventStatus(eventName: EventName) {
    return this.eventStatusTracking.get(eventName) || null;
  }

  saveEventStatusAndNotify(conditions: EventConditions) {
    const { eventName, status } = conditions;

    this.eventStatusTracking.set(eventName, status);

    this.notify(conditions);
  }

  async subscribeToEvent(
    eventName: EventName,
    status: EventStatus,
    subscriberFunction: any
  ) {
    const conditions: EventConditions = {
      eventName,
      status,
    };

    const subscriber: Subscriber<EventConditions> = {
      conditions,
      subscriber: subscriberFunction,
    };

    const result = this.subscribe(subscriber);

    // If the event is already in given status, fire the subscriber function
    if (this.getEventStatus(eventName) === status) await subscriberFunction();

    return result;
  }

  async subscribeToActivationEvent(eventName: EventName, subscriberFunction: any) {
    return await this.subscribeToEvent(
      eventName,
      EVENT_STATUS_ACTIVE,
      subscriberFunction
    );
  }

  subscribeToDeactivationEvent(eventName: EventName, subscriberFunction: any) {
    return this.subscribeToEvent(
      eventName,
      EVENT_STATUS_INACTIVE,
      subscriberFunction
    );
  }

  unsubscribeToEvent(subscriber: Subscriber<EventConditions>) {
    this.unsubscribe(subscriber);
  }

  notifyAboutActivation(eventName: EventName) {
    const eventStatus = EVENT_STATUS_ACTIVE;

    const conditions: EventConditions = {
      eventName,
      status: eventStatus,
    };

    this.saveEventStatusAndNotify(conditions);
  }

  notifyAboutDeactivation(eventName: EventName) {
    const eventStatus = EVENT_STATUS_INACTIVE;

    const conditions: EventConditions = {
      eventName,
      status: eventStatus,
    };

    this.saveEventStatusAndNotify(conditions);
  }
}

export default ActivationMap;
