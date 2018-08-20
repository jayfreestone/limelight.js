import u from '../utils';
import defaultOptions, { OptionsType } from './options';
import CloseEvent from './events/types/CloseEvent';
import OpenEvent from './events/types/OpenEvent';
import EventEmitter from './events/EventEmitter';
import GenericEvent from './events/types/GenericEvent';
import BoundingBoxType from './typedefs/BoundingBoxType';
import TargetType from './typedefs/TargetType';

/**
 * Main library class.
 */
class Implementation {
  private readonly id: string;
  private emitter: EventEmitter;
  // References to DOM elements
  private elems: {
    // The passed in target to highlight
    target: HTMLElement,
    // The lib wrapper element
    limelight: HTMLElement,
    // The transparent 'holes' in the overlay
    maskWindow: HTMLElement,
  };
  private readonly options: OptionsType;
  private observer: MutationObserver;
  private isOpen: boolean;
  private caches: {
    targetQuery: {
      elems: undefined|TargetType,
      result: undefined|string,
    },
  };

  constructor(target: TargetType, options: OptionsType = {}) {
    this.id = `clipElem-${u.uid()}`;

    this.emitter = new EventEmitter();

    this.elems = {
      // Handle querySelector or querySelectorAll
      target: target,
      limelight: undefined,
      maskWindow: undefined,
    };

    this.observer = new MutationObserver(this.mutationCallback.bind(this));

    this.options = u.mergeOptions(defaultOptions, options);

    this.isOpen = false;

    this.caches = {
      animations: [],
      targetQuery: {
        elems: undefined,
        result: undefined,
      },
    };

    this.on = this.on.bind(this);
    this.open = this.open.bind(this);
    this.refocus = this.refocus.bind(this);
    this.close = this.close.bind(this);
    this.reposition = this.reposition.bind(this);
    this.handleClick = this.handleClick.bind(this);

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
        <div class="${this.id}-window limelight__window" id="${this.id}-window"></div>
      </div>
    `;
  }

  /**
   * Takes a position object and adjusts it to accommodate optional offset.
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
   * Extracts classes/ids from target elements to create a css selector.
   */
  private get targetQuery(): string {
    const elem = this.elems.target;
    const id = elem.id ? `#${elem.id}` : '';
    const classes = [...Array.from(elem.classList)].map(x => `.${x}`).join('');
    const targetStr = `${id}${classes}`;
    return `${targetStr}, ${targetStr} *`;
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
   * Runs setup.
   */
  private init() {
    const svgElem = this.createBGElem();
    this.elems.limelight = svgElem.querySelector(`#${this.id}`);
    this.elems.maskWindow = svgElem.querySelector(`.${this.id}-window`);

    document.body.appendChild(svgElem);

    this.reposition();
  }

  /**
   * Returns the height of the document.
   */
  private getPageHeight() {
    const body = document.body;
    const html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
    );
  }

  /**
   * MutationObserver callback.
   */
  private mutationCallback(mutations: MutationEvent[]) {
    mutations.forEach(mutation => {
      // Check if the mutation is one we caused ourselves.
      if (mutation.target !== this.elems.svg && !this.elems.maskWindow === mutation.target) {
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
      document.addEventListener('click', this.handleClick);
    } else {
      this.observer.disconnect();

      window.removeEventListener('resize', this.reposition);
      document.removeEventListener('click', this.handleClick);
    }
  }

  /**
   * Destroys the instance and cleans up.
   */
  destroy() {
    this.elems.limelight.parentNode.removeChild(this.elems.limelight);
  }

  /**
   * Resets the position on the windows.
   */
  reposition(prevPosition) {
    this.elems.limelight.style.height = `${this.getPageHeight()}px`;

    const mask = this.elems.maskWindow;

    const next = this.calculateOffsets(this.elems.target.getBoundingClientRect());

    mask.style.transition = '';
    mask.style.left = `${next.left}px`;
    mask.style.top = `${next.top + window.scrollY}px`;
    mask.style.width = `${next.width}px`;
    mask.style.height = `${next.height}px`;

    if (prevPosition) {
      // Invert: determine the delta between the
      // first and last bounds to invert the element
      const deltaX = prevPosition.left - next.left;
      const deltaY = (prevPosition.top + window.scrollY) - (next.top + window.scrollY);
      const deltaW = prevPosition.width / next.width;
      const deltaH = prevPosition.height / next.height;

      this.caches.anim = mask.animate(
        [
          {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`,
          },
          {
            transform: 'none',
          },
        ],
        800,
      );
    }
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
    // This is safeguard for when the event is not passed in and thus
    // propagation can't be stopped.
    requestAnimationFrame(() => {
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

    if (this.caches.anim) {
      this.caches.anim.cancel();
      this.caches.anim = undefined;

      console.log('cancelled cache');
    }

    this.isOpen = false;

    this.elems.limelight.classList.remove(this.options.classes.activeClass);

    this.elems.limelight.style.height = `${this.getPageHeight()}px`;

    this.emitter.trigger(new CloseEvent());

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
  refocus(target: TargetType, animate = false) {
    if (this.caches.anim) {
      this.caches.anim.cancel();
      this.caches.anim = undefined;
    }

    const prevPosition = this.calculateOffsets(this.elems.target.getBoundingClientRect());
    this.elems.target = target;
    this.reposition(animate ? prevPosition: null);
  }
}

export default Implementation;
