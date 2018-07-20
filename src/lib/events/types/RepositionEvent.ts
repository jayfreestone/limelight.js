import GenericEvent from './GenericEvent';

/**
 * Indicates the windows have been repositioned.
 */
class RepositionEvent extends GenericEvent {
  constructor(...args) {
    super('reposition', ...args);
  }
}

export default RepositionEvent;
