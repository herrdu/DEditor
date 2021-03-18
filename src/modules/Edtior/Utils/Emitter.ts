export type EventType =
  | 'init'
  | 'update'
  | 'transaction'
  | 'paste'
  | 'drop'
  | 'focus'
  | 'blur'
  | 'keydown'
  | 'menubar:focusUpdate';

export interface EventMap {
  init: () => void;
  update: () => void;
  transaction: () => void;
  paste: () => void;
  drop: () => void;
  focus: () => void;
  blur: () => void;
  keydown: () => void;
  'menubar:focusUpdate': (focused: boolean) => void;
}

export default class Emitter {
  _callbacks: {
    [event: string]: Array<any>;
  } = {};

  // Add an event listener for given event
  on<T extends keyof EventMap>(event: T, fn: EventMap[T]) {
    this._callbacks = this._callbacks || {};
    // Create namespace for this event
    if (!this._callbacks[event]) {
      this._callbacks[event] = [];
    }
    this._callbacks[event].push(fn);
    return this;
  }

  emit(event: EventType, ...args: any) {
    this._callbacks = this._callbacks || {};
    const callbacks = this._callbacks[event];

    if (callbacks) {
      callbacks.forEach(callback => callback.apply(this, args));
    }

    return this;
  }

  // Remove event listener for given event.
  // If fn is not provided, all event listeners for that event will be removed.
  // If neither is provided, all event listeners will be removed.
  off(event: EventType, fn: () => {}) {
    if (!arguments.length) {
      this._callbacks = {};
    } else {
      // event listeners for the given event
      const callbacks = this._callbacks ? this._callbacks[event] : null;
      if (callbacks) {
        if (fn) {
          this._callbacks[event] = callbacks.filter(cb => cb !== fn); // remove specific handler
        } else {
          delete this._callbacks[event]; // remove all handlers
        }
      }
    }

    return this;
  }
}
