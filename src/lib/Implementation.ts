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
      target: Array.isArray(target) ? Array.from(target) : [target],
      limelight: undefined,
      maskWindows: undefined,
    };

    // this.observer = new MutationObserver(this.mutationCallback.bind(this));

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
        <canvas></canvas>
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
    this.elems.canvas = svgElem.querySelector('canvas');
    this.elems.ctx = this.elems.canvas.getContext('2d');
    // this.elems.maskWindows = Array.from(svgElem.querySelectorAll(`.${this.id}-window`));

    document.body.appendChild(svgElem);


    this.reposition();
  }

  animLoop() {
    this.elems.limelight.style.height = `${this.getPageHeight()}px`;
    this.elems.canvas.setAttribute('height', this.getPageHeight());
    this.elems.canvas.setAttribute('width', this.getPageWidth());

    this.elems.ctx.globalCompositeOperation = 'xor';

    console.log('running anim loop');
    // this.elems.ctx.fillStyle = 'rgb(0, 0, 0)';
    // this.elems.ctx.fillRect(0, 0, '100%', '100%');

    this.elems.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.elems.ctx.fillRect(0, 0, this.getPageWidth(), this.getPageHeight());

    this.elems.target.forEach((target, i) => {
      const pos = this.calculateOffsets(
        target.getBoundingClientRect(),
      );

      this.elems.ctx.fillStyle = '#fff';

      this.elems.ctx.fillRect(
        Math.floor(pos.left),
        Math.floor(pos.top),
        Math.floor(pos.width),
        Math.floor(pos.height),
      );

      // this.elems.ctx.rect(
      //   Math.floor(pos.left),
      //   Math.floor(pos.top),
      //   Math.floor(pos.width),
      //   Math.floor(pos.height),
      // );

      // this.elems.ctx.stroke();
      // this.elems.ctx.clip();

      // mask.style.transform = `
      //   translate(${pos.left}px, ${pos.top + window.scrollY}px)
      //   scale(${pos.width}, ${pos.height})
      // `;
    });
  }

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

  private getPageWidth() {
    const body = document.body;
    const html = document.documentElement;

    return Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth,
    );
  }

  /**
   * MutationObserver callback.
   */
  private mutationCallback(mutations: MutationEvent[]) {
    // mutations.forEach(mutation => {
    //   // Check if the mutation is one we caused ourselves.
    //   if (mutation.target !== this.elems.svg && !this.elems.maskWindows.find(target => target === mutation.target)) {
    //     this.reposition();
    //   }
    // });
  }

  /**
   * Enables/disables event listeners.
   */
  private listeners(enable = true) {
    if (enable) {
      // this.observer.observe(document, {
      //   attributes: true,
      //   childList: true,
      //   subtree: true,
      // });

      // Required for iOS to handle click event
      document.body.style.cursor = 'pointer';

      window.addEventListener('resize', this.reposition);
      document.addEventListener('click', this.handleClick);
    } else {
      // this.observer.disconnect();

      document.body.style.cursor = '';

      window.removeEventListener('resize', this.reposition);
      document.removeEventListener('click', this.handleClick);
    }
  }

  /**
   * Destroys the instance and cleans up.
   */
  destroy() {
    cancelAnimationFrame(this.loop);
    this.elems.limelight.parentNode.removeChild(this.elems.limelight);
  }

  /**
   * Resets the position on the windows.
   */
  reposition() {
    // this.elems.limelight.style.height = `${this.getPageHeight()}px`;
    requestAnimationFrame(this.animLoop.bind(this));

    // this.elems.maskWindows.forEach((mask, i) => {
    //   const pos = this.calculateOffsets(
    //     this.elems.target[i].getBoundingClientRect(),
    //   );
    //
    //   mask.style.transform = `
    //     translate(${pos.left}px, ${pos.top + window.scrollY}px)
    //     scale(${pos.width}, ${pos.height})
    //   `;
    // });
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
  refocus(target: TargetType) {
    this.elems.target = Array.isArray(target) ? Array.from(target) : [target];
    this.reposition();
  }
}

export default Implementation;
