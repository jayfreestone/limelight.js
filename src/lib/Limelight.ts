import Implementation from './Implementation';
import { OptionsType } from './options';

/**
 * Methods and properties to make public.
 */
const publicAPI = ['on', 'open', 'refocus', 'destroy', 'reposition'];

/**
 * Library Implementation with public API exposed.
 */
class Limelight {
  constructor(target: HTMLElement, wrapper: HTMLElement, options: OptionsType) {
    const implementation = new Implementation(target, wrapper, options);

    publicAPI.forEach((prop) => {
      this[prop] = implementation[prop];
    });
  }
}

export default Limelight;
