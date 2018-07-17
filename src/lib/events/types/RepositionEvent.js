import GenericEvent from './GenericEvent';

class RepositionEvent extends GenericEvent {
  constructor(...args) {
    super('reposition', ...args);
  }
}

export default RepositionEvent;
