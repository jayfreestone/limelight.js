import GenericEvent from './GenericEvent';

class CloseEvent extends GenericEvent {
  constructor(...args) {
    super('close', ...args);
  }
}

export default CloseEvent;
