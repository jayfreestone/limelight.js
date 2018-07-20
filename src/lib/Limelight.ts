import Implementation from './Implementation';
import { OptionsType } from './options';

const publicAPI = ['on', 'open', 'refocus', 'destroy', 'reposition'];

class Limelight {
  constructor(target: HTMLElement, options: OptionsType) {
    const implementation = new Implementation(target, options);

    publicAPI.forEach((prop) => {
      this[prop] = implementation[prop];
    });
  }
}

export default Limelight;
