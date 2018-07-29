import _throttle from 'lodash/throttle';
import u from '../utils';
import defaultOptions, { OptionsType } from './options';
import CloseEvent from './events/types/CloseEvent';
import OpenEvent from './events/types/OpenEvent';
import EventEmitter from './events/EventEmitter';
import GenericEvent from './events/types/GenericEvent';
import BoundingBoxType from './typedefs/BoundingBoxType';
import TargetType from './typedefs/TargetType';

class Implementation {
  private id: string;
  private emitter: EventEmitter;
  private topOffset: number;
  private elems: {
    target: HTMLElement[],
    limelight: HTMLElement,
    maskWindows: HTMLElement[],
  };
  private positions: any;
  private options: OptionsType;
  private isOpen: boolean;
  private loop: undefined|number;
  private observer: MutationObserver;
  private caches: {
    targetSize: {
      elems: undefined|TargetType,
      result: undefined|object[],
    },
    targetQuery: {
      elems: undefined|TargetType,
      result: undefined|string,
    },
  };

  constructor(target: TargetType, options: OptionsType = {}) {
    this.id = 'clipElem';

    this.loop = undefined;

    this.emitter = new EventEmitter();

    this.topOffset = window.pageYOffset;

    this.elems = {
      // Handle querySelector or querySelectorAll
      target: Array.isArray(target) ? Array.from(target) : [target],
      limelight: undefined,
      maskWindows: undefined,
    };

    this.positions = [];

    this.options = u.mergeOptions(defaultOptions, options);

    this.isOpen = false;

    this.caches = {
      targetSize: {
        elems: undefined,
        result: [],
      },
      targetQuery: {
        elems: undefined,
        result: undefined,
      },
    };

    this.on = this.on.bind(this);
    this.open = this.open.bind(this);
    this.refocus = this.refocus.bind(this);
    this.close = this.close.bind(this);
    this.reposition = _throttle(this.reposition.bind(this), 300);
    this.repositionLoop = this.repositionLoop.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.observer = new MutationObserver(this.mutationCallback.bind(this));

    this.init();
  }

  /**
   * Create an Document Fragment based on an overlay string
   */
  private createBGElem(): DocumentFragment {
    return document.createRange().createContextualFragment(this.renderOverlay());
  }

  /**
   * Creates a string that represents gradient stop points.
   */
  private renderOverlay(): string {
    return `
      <div class="limelight" id="${this.id}" aria-hidden>
        ${this.elems.target.map((elem, i) => `
          <div class="${this.id}-window limelight__window" id="${this.id}-window-${i}"></div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Takes a position object and adjusts it to accomodate optional offset.
   *
   * @param position - The result of getClientBoundingRect()
   */
  private calculateOffsets(position: BoundingBoxType) {
    const { offset } = this.options;
    const {
      left,
      top,
      width,
      height,
    } = position;

    return {
      left: left - offset,
      top: top - offset,
      width: width + (offset * 2),
      height: height + (offset * 2),
    };
  }

  /**
   * A RAF loop that re-runs reposition if the scroll position has changed.
   *
   * @todo Re-add some kind of caching? 
   */
  private repositionLoop() {
    this.reposition();
    this.loop = requestAnimationFrame(this.repositionLoop);
  }

  /**
   * Extracts classes/ids from target elements to create a css selector.
   */
  private get targetQuery(): string {
    if (this.caches.targetQuery.elems !== this.elems.target) {
      this.caches.targetQuery.elems = this.elems.target;

      this.caches.targetQuery.result = this.elems.target.reduce((str, elem) => {
        const id = elem.id ? `#${elem.id}` : '';
        const classes = [...Array.from(elem.classList)].map(x => `.${x}`).join('');
        const targetStr = `${id}${classes}`;
        // @todo Check this with multiple targets
        return `${str} ${targetStr}, ${targetStr} *`;
      }, '');
    }

    return this.caches.targetQuery.result;
  }

  /**
   * Closes the overlay if the click happens outside of one of the target elements.
   */
  private handleClick(e: MouseEvent) {
    if (!this.options.closeOnClick) return;

    if (!e.target.matches(this.targetQuery)) {
      this.close();
    }
  }

  /**
   * MutationObserver callback.
   */
  private mutationCallback(mutations: MutationEvent[]) {
    mutations.forEach(mutation => {
      // Check if the mutation is one we caused ourselves.
      if (!this.elems.maskWindows.find(target => target === mutation.target)) {
        this.reposition();
      } 
    });
  }

  /**
   * Enables/disables event listeners.
   */
  private listeners(enable = true) {
    if (enable) {
      this.observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      window.addEventListener('resize', this.reposition);
      window.addEventListener('scroll', this.reposition);
    } else {
      this.observer.disconnect();

      window.removeEventListener('resize', this.reposition);
      window.removeEventListener('scroll', this.reposition);
    }
  }

  /**
   * Runs setup.
   */
  private init() {
    const svgElem = this.createBGElem();
    this.elems.limelight = svgElem.querySelector(`#${this.id}`);
    this.elems.maskWindows = Array.from(svgElem.querySelectorAll(`.${this.id}-window`));

    document.body.appendChild(svgElem);

    this.reposition();
  }

  /**
   * Destroys the instance and cleans up.
   */
  destroy() {
    if (this.loop) cancelAnimationFrame(this.loop);
    this.elems.limelight.parentNode.removeChild(this.elems.limelight);
  }

  /**
   * Resets the position on the windows.
   */
  reposition() {
    console.log('reposition');
    this.elems.maskWindows.forEach((mask, i) => {
      const first = this.calculateOffsets(this.elems.target[i].getBoundingClientRect());

      mask.style.left = `${first.left}px`;
      mask.style.top = `${first.top}px`;
      mask.style.width = `${first.width}px`;
      mask.style.height = `${first.height}px`;

      const last = this.calculateOffsets(this.elems.target[i].getBoundingClientRect());

      // Invert: determine the delta between the 
      // first and last bounds to invert the element
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;
      const deltaW = first.width / last.width;
      const deltaH = first.height / last.height;

      mask.style.transformOrigin = 'top left';
      mask.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;

      this.elems.target[i].getBoundingClientRect();

      mask.style.transform = '';
    });
  }

  /**
   * Open the overlay.
   */
  open(e: MouseEvent) {
    if (this.isOpen) return;

    this.isOpen = true;

    // If it looks like an event, try to stop it bubbling.
    if (e && e.target) {
      e.stopPropagation();
    }

    this.emitter.trigger(new OpenEvent());

    // If we don't encourage the listener to happen on next-tick,
    // we'll end up with the listener firing for this if it was triggered on-click.
    // This is safeguard for when the event is not passed in and thus propgation
    // can't be stopped.
    requestAnimationFrame(() => {
      document.addEventListener('click', this.handleClick);
      // this.repositionLoop();
      this.reposition();
      this.elems.limelight.classList.add(this.options.classes.activeClass);
      this.listeners();
    });
  }

  /**
   * Close the overlay.
   */
  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    this.elems.limelight.classList.remove(this.options.classes.activeClass);

    this.emitter.trigger(new CloseEvent());

    document.removeEventListener('click', this.handleClick);

    cancelAnimationFrame(this.loop);

    this.listeners(false);
  }

  /**
   * Passes through the event to the emitter.
   */
  on(event: GenericEvent, callback: Function) {
    this.emitter.on(event, callback);
  }

  /**
   * Change the window focus to a different element/set of elements.
   */
  refocus(target: TargetType) {
    this.elems.target = Array.isArray(target) ? Array.from(target) : [target];
    this.reposition();
  }
}

export default Implementation;
