import GenericEvent from './GenericEvent';

/**
 * Indicates the instance has been closed.
 */
class CloseEvent extends GenericEvent {
  constructor(...args) {
    super('close', ...args);
  }
}

export default CloseEvent;
