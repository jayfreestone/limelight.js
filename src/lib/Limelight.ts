// @ts-check
import Implementation from './Implementation';

const publicAPI = ['on', 'open', 'refocus', 'destroy', 'reposition'];

class Limelight {
  constructor(target, options) {
    const implementation = new Implementation(target, options);

    publicAPI.forEach((prop) => {
      this[prop] = implementation[prop];
    });
  }
}

export default Limelight;
