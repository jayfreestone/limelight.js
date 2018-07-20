/**
 * The base 'event' class used by an EventEmitter.
 */
class GenericEvent {
  private eventType: string;
  private payload: object;

  /**
   * @param eventType - The 'type' that will be listened for.
   * @param payload - Any additional data.
   */
  constructor(eventType: string, payload: object = {}) {
    this.eventType = eventType;
    this.payload = payload;
  }

  set type(eventType: string) {
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
