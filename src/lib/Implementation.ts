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
    target: HTMLElement[],
    // The lib wrapper element
    limelight: HTMLElement,
    // The transparent 'holes' in the overlay
    maskWindows: HTMLElement[],
    wrapper: HTMLElement,
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

  constructor(target: TargetType, wrapper: HTMLElement, options: OptionsType = {}) {
    this.id = `clipElem-${u.uid()}`;

    this.emitter = new EventEmitter();

    this.elems = {
      // Handle querySelector or querySelectorAll
      target: Array.isArray(target) ? Array.from(target) : [target],
      limelight: undefined,
      maskWindows: undefined,
      wrapper,
    };

    this.observer = new MutationObserver(this.mutationCallback.bind(this));

    this.options = u.mergeOptions(defaultOptions, options);

    this.isOpen = false;

    this.caches = {
      targetQuery: {
        elems: undefined,
        result: undefined,
      },
    };

    this.on = this.on.bind(this);
    this.open = this.open.bind(this);
    this.refocus = this.refocus.bind(this);
    this.destroy = this.destroy.bind(this);
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
    const { styles = {} } = this.options;

    /**
     * Custom properties passed in as options are applied inline. If it has
     * been passed in we use to to populate the array and generate the
     * inline style attribute.
     */
    const inlineVars = [
      styles.bg &&
        `--limelight-bg: ${styles.bg}`,
      styles.overlayTransitionDuration &&
        `--limelight-overlay-transition-duration: ${styles.overlayTransitionDuration}`,
      styles.windowTransitionDuration &&
        `--limelight-window-transition-duration: ${styles.windowTransitionDuration}`,
      styles.zIndex &&
        `--limelight-z-index: ${styles.zIndex}`,
    ];

    return `
      <div 
        class="limelight"
        id="${this.id}"
        style="${inlineVars.filter(Boolean).join(' ')}"
        aria-hidden
      >
        ${this.elems.target.map((elem, i) => `
          <div class="${this.id}-window limelight__window" id="${this.id}-window-${i}">
            <div class="${this.id}-window-corner limelight__window-corner" id="${this.id}-window-corner-${i}-1"></div>
            <div class="${this.id}-window-corner limelight__window-corner" id="${this.id}-window-corner-${i}-2"></div>
            <div class="${this.id}-window-corner limelight__window-corner" id="${this.id}-window-corner-${i}-3"></div>
            <div class="${this.id}-window-corner limelight__window-corner" id="${this.id}-window-corner-${i}-4"></div>

            <div class="${this.id}-window-frame limelight__window-frame" id="${this.id}-window-frame-${i}-1"></div>
            <div class="${this.id}-window-frame limelight__window-frame" id="${this.id}-window-frame-${i}-2"></div>
          </div>
        `).join('')}
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
      left: left - offset + 12,
      top: top - offset + 12,
      width: width + (offset * 2) - 24,
      height: height + (offset * 2) - 24,
    };
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
   * Runs setup.
   */
  private init() {
    const svgElem = this.createBGElem();
    this.elems.limelight = svgElem.querySelector(`#${this.id}`);
    this.elems.maskWindows = Array.from(svgElem.querySelectorAll(`.${this.id}-window`));

    this.elems.wrapper.appendChild(svgElem);

    this.reposition();
  }

  /**
   * MutationObserver callback.
   */
  private mutationCallback(mutations: MutationEvent[]) {
    mutations.forEach(mutation => {
      // Check if the mutation is one we caused ourselves.
      if (mutation.target !== this.elems.svg && !this.elems.maskWindows.find(target => target === mutation.target)) {
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

      // Required for iOS to handle click event
      document.body.style.cursor = 'pointer';

      window.addEventListener('resize', this.reposition);
      document.addEventListener('click', this.handleClick);
    } else {
      this.observer.disconnect();

      document.body.style.cursor = '';

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
  reposition() {
    this.elems.maskWindows.forEach((mask, i) => {
      const pos = this.calculateOffsets(
        this.elems.target[i].getBoundingClientRect(),
      );

      const maskMain = mask.querySelector(`.${this.id}-window-main`);

      // maskMain.style.transform = `
      //   translate(${pos.left}px, ${pos.top + window.scrollY}px)
      //   scale(${pos.width}, ${pos.height})
      // `;

      const corners = Array.from(mask.querySelectorAll(`.${this.id}-window-corner`));
      const frames = Array.from(mask.querySelectorAll(`.${this.id}-window-frame`));

      frames[0].style.transform = `
        translate(${pos.left}px, ${pos.top + window.scrollY - 12}px)
        scale(${pos.width}, ${pos.height + 24})
      `;

      frames[1].style.transform = `
        translate(${pos.left - 12}px, ${pos.top + window.scrollY}px)
        scale(${pos.width + 24}, ${pos.height})
      `;

      corners[0].style.transform = `
        translate(${pos.left - 12}px, ${pos.top + window.scrollY - 12}px)
      `;

      corners[1].style.transform = `
        translate(${pos.left + pos.width - 12}px, ${pos.top + window.scrollY - 12}px)
      `;

      corners[2].style.transform = `
        translate(${pos.left + pos.width - 12}px, ${pos.top + window.scrollY + pos.height - 12}px)
      `;

      corners[3].style.transform = `
        translate(${pos.left - 12}px, ${pos.top + window.scrollY + pos.height - 12}px)
      `;

      // corners[0].style.transform = `
      //   translate(${pos.left - 24}px, ${pos.top + window.scrollY}px)
      // `;

      // corners[1].style.transform = `
      //   translate(${pos.left + pos.width}px, ${pos.top + window.scrollY }px)
      // `;

      // corners[2].style.transform = `
      //   translate(${pos.left + pos.width}px, ${pos.top + window.scrollY + pos.height - 24}px)
      // `;

      // corners[3].style.transform = `
      //   translate(${pos.left - 24}px, ${pos.top + window.scrollY + pos.height - 24}px)
      // `;

      // console.log(pos.width - 24, pos.height - 24);

      // maskMain.style.transform = `
      //   translate(${pos.left}px, ${pos.top + window.scrollY}px)
      //   scale(${pos.width}, ${pos.height})
      // `;
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
    // This is safeguard for when the event is not passed in and thus propagation
    // can't be stopped.
    requestAnimationFrame(() => {
      this.reposition();

      // Force active class to be applied after the 'paint' and calculation
      // of the reposition, or we risk the transition happening on first load.
      requestAnimationFrame(() => {
        this.elems.limelight.classList.add(this.options.classes.activeClass);
      });

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
