// @ts-check
import u from '../utils';
import CloseEvent from './events/types/CloseEvent';
import OpenEvent from './events/types/OpenEvent';
import RepositionEvent from './events/types/RepositionEvent';
import EventEmitter from './events/EventEmitter';

class LimelightImplementation {
  constructor(target, options = {}) {
    this.id = 'clipElem';

    this.emitter = new EventEmitter();

    this.topOffset = window.pageYOffset;

    this.elems = {
      // Handle querySelector or querySelectorAll
      target: target.length > 1 ? Array.from(target) : [target],
    };

    this.positions = [];

    this.options = u.mergeOptions(LimelightImplementation.defaultOptions, options);

    this.isOpen = false;

    this.on = this.on.bind(this);
    this.open = this.open.bind(this);
    this.refocus = this.refocus.bind(this);
    this.close = this.close.bind(this);
    this.reposition = this.reposition.bind(this);
    this.repositionLoop = this.repositionLoop.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.init();

    this.caches = {
      targetQuery: {
        elems: undefined,
        result: undefined,
      },
    };
  }

  destroy() {
    if (this.loop) cancelAnimationFrame(this.loop);
    this.elems.limelight.parentNode.removeChild(this.elems.limelight);
  }

  createBGElem() {
    const svgTemplate = this.renderSVG();
    return document.createRange().createContextualFragment(svgTemplate);
  }

  /**
   * Creates a string that represents gradient stop points.
   * @return string
   */
  renderSVG() {
    return `
      <div class="limelight" id="${this.id}" aria-hidden>
        ${this.elems.target.map((elem, i) => `
          <div class="${this.id}-window limelight__window" id="${this.id}-window-${i}"></div>
        `).join('')}
      </div>
    `;
  }

  reposition() {
    this.emitter.trigger(new RepositionEvent());

    this.elems.maskWindows.forEach((mask, i) => {
      const first = this.calculateOffsets(this.elems.target[i].getBoundingClientRect());

      mask.style.left = `${first.left}px`;
      mask.style.top = `${first.top}px`;
      mask.style.width = `${first.width}px`;
      mask.style.height = `${first.height}px`;

      // mask.setAttribute('x', first.left);
      // mask.setAttribute('y', first.top);
      // mask.setAttribute('width', first.width);
      // mask.setAttribute('height', first.height);

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

  calculateOffsets({ left, top, width, height }) {
    const { offset } = this.options;

    return {
      left: left - offset,
      top: top - offset,
      width: width + (offset * 2),
      height: height + (offset * 2),
    };
  }

  repositionLoop() {
    if (this.topOffset !== window.pageYOffset) {
      this.reposition();
    }

    this.topOffset = window.pageYOffset;

    this.loop = requestAnimationFrame(this.repositionLoop);
  }

  init() {
    const svgElem = this.createBGElem();
    this.elems.limelight = svgElem.querySelector(`#${this.id}`);
    this.elems.maskWindows = Array.from(svgElem.querySelectorAll(`.${this.id}-window`));

    document.body.appendChild(svgElem);

    this.reposition();
  }

  open(e) {
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

      this.loop = this.repositionLoop();
    });
  }

  get targetQuery() {
    if (this.caches.targetQuery.elems !== this.elems.target) {
      this.caches.targetQuery.elems = this.elems.target;

      this.caches.targetQuery.result = this.elems.target.reduce((str, elem) => {
        const id = elem.id ? `#${elem.id}` : '';
        const classes = [...elem.classList].map(x => `.${x}`).join('');
        return `${str} ${id}${classes}`;
      }, '');
    }

    return this.caches.targetQuery.result;
  }

  handleClick(e) {
    if (!this.options.closeOnClick) return;

    if (!e.target.matches(this.targetQuery)) {
      this.close();
    }
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    this.elems.limelight.classList.remove(this.options.classes.activeClass);

    this.emitter.trigger(new CloseEvent());

    document.removeEventListener('click', this.handleClick);

    cancelAnimationFrame(this.loop);
  }

  static trigger(eventInstance, target) {
    target.dispatchEvent(eventInstance);
  }

  on(event, callback) {
    this.emitter.on(event, callback);
    // this.elems.limelight.addEventListener(event, callback);
  }

  refocus(target) {
    this.elems.target = target.length > 1 ? Array.from(target) : [target];
    // cancelAnimationFrame(this.loop);
    this.reposition();
  }
}

LimelightImplementation.defaultOptions = {
  offset: 10,
  closeOnClick: true,
  classes: {
    window: 'limelight__window',
    activeClass: 'limelight--is-active',
  },
};

const api = ['on', 'open', 'refocus'];

class Limelight {
  constructor(target, options = {}) {
    const implementation = new LimelightImplementation(target, options);

    api.forEach((prop) => {
      this[prop] = implementation[prop];
    });
  }
}

export default Limelight;
