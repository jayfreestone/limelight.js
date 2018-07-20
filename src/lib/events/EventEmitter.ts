import GenericEvent from './types/GenericEvent';

/**
 * Allows registration of callbacks that will be triggered on specific events.
 */
class EventEmitter {
  private callbacks: {
    [s: string]: Function[],
  };

  constructor() {
    this.callbacks = {};
  }

  /**
   * Used to listen for an event and fire a callback.
   *
   * @param type - The event type, will need to match an existing type.
   * @param callback - The callback function to run.
   */
  on(type: string, callback: Function) {
    this.callbacks = Object.assign({}, this.callbacks, {
      [type]: [...(this.callbacks[type] || []), callback],
    });
  }

  /**
   * Takes an event (e.g. Open) and fires the callbacks for it.
   *
   * @param event - The event type.
   * @example emitter.trigger(new OpenEvent());
   */
  trigger(event: GenericEvent) {
    if (!(event instanceof GenericEvent)) {
      console.error('Not a valid GenericEvent instance.', event);
      return;
    }

    const callbacks = this.callbacks[event.type];

    if (!callbacks) return;

    callbacks.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export default EventEmitter;
