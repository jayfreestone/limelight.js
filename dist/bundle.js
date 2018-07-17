(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  function mergeOptions(defaultOptions = {}, userOptions = {}) {
    return Object.keys(defaultOptions)
      .reduce((obj, key) => (
        Object.assign(obj, {
          [key]: userOptions[key]
            ? userOptions[key]
            : defaultOptions[key],
        })
      ), {});
  }

  var u = {
    mergeOptions,
  };

  /**
   * The base 'event' class used by an EventEmitter.
   *
   * @class GenericEvent
   */
  class GenericEvent {
    /**
     * @param {string} eventType - The 'type' that will be listened for.
     * @param {object} payload - Any additional data.
     */
    constructor(eventType, payload = {}) {
      this.type = eventType;
      this.payload = payload;
    }

    /**
     * @param {string} eventType
     */
    set type(eventType) {
      // Do not allow re-assignment
      if (this.eventType) return;
      this.eventType = eventType;
    }

    /**
     * @return string;
     */
    get type() {
      if (!this.eventType) {
        throw new Error('Not implemented.');
      }

      return this.eventType;
    }
  }

  class CloseEvent extends GenericEvent {
    constructor(...args) {
      super('close', ...args);
    }
  }

  /**
   * Indicates the instance has opened.
   *
   * @class OpenEvent
   * @extends {GenericEvent}
   */
  class OpenEvent extends GenericEvent {
    constructor(...args) {
      super('open', ...args);
    }
  }

  class RepositionEvent extends GenericEvent {
    constructor(...args) {
      super('reposition', ...args);
    }
  }

  /**
   * Allows registration of callbacks that will be triggered on specific events.
   *
   * @class EventEmitter
   */
  class EventEmitter {
    constructor() {
      this.callbacks = {};
    }

    /**
     * Used to listen for an event and fire a callback.
     *
     * @param {string} type - The event type, will need to match an existing type.
     * @param {function} callback - The callback function to run.
     */
    on(type, callback) {
      this.callbacks = Object.assign({}, this.callbacks, {
        [type]: [...(this.callbacks[type] || []), callback],
      });
    }

    /**
     * Takes an event (e.g. Open) and fires the callbacks for it.
     *
     * @param {GenericEvent} event - The event type.
     * @example emitter.trigger(new OpenEvent());
     */
    trigger(event) {
      if (!(event instanceof GenericEvent)) {
        console.error('Not a valid GenericEvent instance.', event);
        return;
      }

      const callbacks = this.callbacks[event.type];

      if (!callbacks) return;

      callbacks.forEach((cb) => {
        try {
          cb(event);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  // @ts-check

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

  document.addEventListener('DOMContentLoaded', () => {
    // const targets = document.querySelectorAll('.box__thing');
    const targets = document.querySelector('.box__thing');
    const boxGrad = new Limelight(targets);

    document.querySelector('.js-start').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      boxGrad.open();
    });

    boxGrad.on('open', (e) => {
      console.log('opening', e);
    });

    boxGrad.on('close', (e) => {
      console.log('closing', e);
    });

    boxGrad.on('reposition', (e) => {
      console.log('repositioning', e);
    });


    setTimeout(() => {
      boxGrad.refocus(document.querySelector('.other-thing'));
    }, 2000);

    // targets.forEach(target => {
    //   target.addEventListener('open', () => {
    //     console.log('we are opening');
    //   });
    //   target.addEventListener('close', () => {
    //     console.log('we are closing');
    //   });
    // })

    console.log(boxGrad);
  });

})));
//# sourceMappingURL=bundle.js.map
