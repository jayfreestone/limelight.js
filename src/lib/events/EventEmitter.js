import GenericEvent from './types/GenericEvent';

/**
 * Allows registration of callbacks that will be triggered on specific events.
 *
 * @class EventEmitter
 */
class EventEmitter {
  constructor() {
    this.callbacks = {};
  }

  /**
   * Used to listen for an event and fire a callback.
   *
   * @param {string} type - The event type, will need to match an existing type.
   * @param {function} callback - The callback function to run.
   */
  on(type, callback) {
    this.callbacks = Object.assign({}, this.callbacks, {
      [type]: [...(this.callbacks[type] || []), callback],
    });
  }

  /**
   * Takes an event (e.g. Open) and fires the callbacks for it.
   *
   * @param {GenericEvent} event - The event type.
   * @example emitter.trigger(new OpenEvent());
   */
  trigger(event) {
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
