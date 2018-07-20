import GenericEvent from './GenericEvent';

/**
 * Indicates the instance has opened.
 */
class OpenEvent extends GenericEvent {
  constructor(...args) {
    super('open', ...args);
  }
}

export default OpenEvent;
