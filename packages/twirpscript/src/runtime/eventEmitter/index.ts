type EventArguments<T> = T extends (...args: infer Args) => void ? Args : [];

export interface Emitter<Events> {
  on: <Event extends keyof Events>(
    event: Event,
    handler: Events[Event],
  ) => void;
  off: <Event extends keyof Events>(
    event: Event,
    handler: Events[Event],
  ) => void;
  emit: <Event extends keyof Events>(
    event: Event,
    ...args: EventArguments<Events[Event]>
  ) => void;
}

type EventListeners<Events> = {
  [Event in keyof Events]?: Events[Event][];
};

export function createEventEmitter<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Events extends Record<string, Function>,
>(): Emitter<Events> {
  const listeners: EventListeners<Events> = {};

  return {
    on: (eventName, listener) => {
      listeners[eventName] ??= [];
      listeners[eventName]?.push(listener);
    },
    off: (eventName, listener) => {
      listeners[eventName] = listeners[eventName]?.filter(
        (x) => x !== listener,
      );
    },
    emit: (eventName, ...args) => {
      listeners[eventName]?.forEach((cb) => {
        cb(...args);
      });
    },
  };
}
