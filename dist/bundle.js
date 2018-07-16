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

  // @ts-check

  class Limelight {
    constructor(target, options = {}) {
      this.id = 'clipElem';

      this.topOffset = window.pageYOffset;

      this.elems = {
        // Handle querySelector or querySelectorAll
        target: target.length > 1 ? Array.from(target) : [target],
      };

      this.positions = [];

      this.options = u.mergeOptions(Limelight.defaultOptions, options);

      this.isOpen = false;

      this.events = {
        open: new Event('open'),
        close: new Event('close'),
      };

      this.close = this.close.bind(this);
      this.reposition = this.reposition.bind(this);
      this.repositionLoop = this.repositionLoop.bind(this);

      this.init();
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
        <svg height="100%" width="100%">
          <defs>
            <mask id="${this.id}-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              ${this.elems.target.map((elem, i) => `
                <rect class="${this.id}-window" id="${this.id}-window-${i}" x="0" y="0" width="0" height="0" fill="black" />
              `).join('')}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.8" style="mask: url('#${this.id}-mask'); pointer-events: none;" />
        </svg> 
      </div>
    `;
    }

    reposition(animate = false) {
      this.elems.maskWindows.forEach((mask, i) => {

        const first = this.calculateOffsets(this.elems.target[i].getBoundingClientRect());

        mask.setAttribute('x', first.left);
        mask.setAttribute('y', first.top);
        mask.setAttribute('width', first.width);
        mask.setAttribute('height', first.height);

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
      // this.bindListeners();
    }

    open(e) {
      if (this.isOpen) return;

      this.isOpen = true;

      // If it looks like an event, try to stop it bubbling.
      if (e && e.target) {
        e.stopPropagation();
      }

      this.elems.limelight.classList.add(this.options.classes.activeClass);

      this.broadcastEvent(this.events.open);

      // If we don't encourage the listener to happen on next-tick,
      // we'll end up with the listener firing for this if it was triggered on-click.
      // This is safeguard for when the event is not passed in and thus propgation
      // can't be stopped.
      requestAnimationFrame(() => {
        if (this.options.closeOnClick) {
          document.addEventListener('click', this.close);
        }

        this.loop = this.repositionLoop();
      });
    }

    close() {
      if (!this.isOpen) return;

      this.isOpen = false;

      this.elems.limelight.classList.remove(this.options.classes.activeClass);

      this.broadcastEvent(this.events.close);

      document.removeEventListener('click', this.close);

      cancelAnimationFrame(this.loop);
    }

    broadcastEvent(event) {
      [...this.elems.target, this.elems.limelight]
        .forEach(elem => elem.dispatchEvent(event));
    }

    on(event, callback) {
      this.elems.limelight.addEventListener(event, callback);
    }

    refocus(target) {
      this.elems.target = target.length > 1 ? Array.from(target) : [target];
      this.reposition(true);
    }

    // bindListeners() {
      // this.loop = requestAnimationFrame(this.repositionLoop);
    // }
  }

  Limelight.defaultOptions = {
    offset: 10,
    closeOnClick: true,
    classes: {
      activeClass: 'limelight--is-active',
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    // const targets = document.querySelectorAll('.box__thing');
    const targets = document.querySelector('.box__thing');
    const boxGrad = new Limelight(targets);

    document.querySelector('.js-start').addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      boxGrad.open();
    });

    boxGrad.on('open', () => {
      console.log('opening');
    });

    boxGrad.on('close', () => {
      console.log('closing');
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
