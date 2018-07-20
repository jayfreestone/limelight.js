// @ts-check
import u from '../utils';
import defaultOptions, { OptionsType } from './options';
import CloseEvent from './events/types/CloseEvent';
import OpenEvent from './events/types/OpenEvent';
import RepositionEvent from './events/types/RepositionEvent';
import EventEmitter from './events/EventEmitter';
import GenericEvent from './events/types/GenericEvent';
import BoundingBoxType from './typedefs/BoundingBoxType';
import TargetType from './typedefs/TargetType';

class Implementation {
  private id: string;
  private emitter: any;
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
  private caches: {
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
    };

    this.positions = [];

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
    this.close = this.close.bind(this);
    this.reposition = this.reposition.bind(this);
    this.repositionLoop = this.repositionLoop.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.init();
  }

  private createBGElem(): DocumentFragment {
    const svgTemplate = this.renderSVG();
    return document.createRange().createContextualFragment(svgTemplate);
  }

  /**
   * Creates a string that represents gradient stop points.
   */
  private renderSVG(): string {
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

  private repositionLoop() {
    if (this.topOffset !== window.pageYOffset) {
      this.reposition();
    }

    this.topOffset = window.pageYOffset;

    this.loop = requestAnimationFrame(this.repositionLoop);
  }

  private get targetQuery() {
    if (this.caches.targetQuery.elems !== this.elems.target) {
      this.caches.targetQuery.elems = this.elems.target;

      this.caches.targetQuery.result = this.elems.target.reduce((str, elem) => {
        const id = elem.id ? `#${elem.id}` : '';
        const classes = [...Array.from(elem.classList)].map(x => `.${x}`).join('');
        return `${str} ${id}${classes}`;
      }, '');
    }

    return this.caches.targetQuery.result;
  }

  private handleClick(e: MouseEvent) {
    if (!this.options.closeOnClick) return;

    if (!e.target.matches(this.targetQuery)) {
      this.close();
    }
  }

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
    this.emitter.trigger(new RepositionEvent());

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

      mask.style.transition = 'all 3s';
      mask.style.transform = '';
    });
  }

  open(e: MouseEvent) {
    if (this.isOpen) return;

    this.isOpen = true;

    // If it looks like an event, try to stop it bubbling.
    if (e && e.target) {
      e.stopPropagation();
    }

    this.elems.limelight.classList.add(this.options.classes.activeClass);

    this.emitter.trigger(new OpenEvent());

    // If we don't encourage the listener to happen on next-tick,
    // we'll end up with the listener firing for this if it was triggered on-click.
    // This is safeguard for when the event is not passed in and thus propgation
    // can't be stopped.
    requestAnimationFrame(() => {
      document.addEventListener('click', this.handleClick);
      this.repositionLoop();
    });
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    this.elems.limelight.classList.remove(this.options.classes.activeClass);

    this.emitter.trigger(new CloseEvent());

    document.removeEventListener('click', this.handleClick);

    cancelAnimationFrame(this.loop);
  }

  /**
   * Passes through the event to the emitter.
   */
  on(event: GenericEvent, callback: Function) {
    this.emitter.on(event, callback);
  }

  refocus(target: TargetType) {
    this.elems.target = Array.isArray(target) ? Array.from(target) : [target];
    this.reposition();
  }
}

export default Implementation;
