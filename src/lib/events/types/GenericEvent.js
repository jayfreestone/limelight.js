/**
 * The base 'event' class used by an EventEmitter.
 *
 * @class GenericEvent
 */
class GenericEvent {
  /**
   * @param {string} eventType - The 'type' that will be listened for.
   * @param {object} payload - Any additional data.
   */
  constructor(eventType, payload = {}) {
    this.type = eventType;
    this.payload = payload;
  }

  /**
   * @param {string} eventType
   */
  set type(eventType) {
    // Do not allow re-assignment
    if (this.eventType) return;
    this.eventType = eventType;
  }

  /**
   * @return string;
   */
  get type() {
    if (!this.eventType) {
      throw new Error('Not implemented.');
    }

    return this.eventType;
  }
}

export default GenericEvent;
