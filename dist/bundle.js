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

      this.elems = {
        // Handle querySelector or querySelectorAll
        target: target.length > 1 ? Array.from(target) : [target],
      };

      this.options = u.mergeOptions(Limelight.defaultOptions, options);

      this.init();
    }

    destroy() {
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
      <div class="limelight" id="${this.id}">
        <svg height="100%" width="100%">
          <defs>
            <mask>
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              ${this.elems.target.map((elem, i) => `
                <rect class="${this.id}-window" id="${this.id}-window-${i}" x="0" y="0" width="0" height="0" fill="black" />
              `).join('')}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="black" opacity="0.8" style="mask: url('#${this.id}'); pointer-events: none;" />
        </svg> 
      </div>
    `;
    }

    reposition() {
      this.elems.maskWindows.forEach((mask, i) => {
        const pos = this.elems.target[i].getBoundingClientRect();
        mask.setAttribute('x', pos.x - this.options.offset);
        mask.setAttribute('y', pos.y - this.options.offset);
        mask.setAttribute('width', pos.width + (this.options.offset * 2));
        mask.setAttribute('height', pos.height + (this.options.offset * 2));
      });
    }

    init() {
      const svgElem = this.createBGElem();
      this.elems.limelight = svgElem.querySelector(`#${this.id}`);
      this.elems.maskWindows = Array.from(svgElem.querySelectorAll(`.${this.id}-window`));

      document.body.appendChild(svgElem);

      this.reposition();
    }
  }

  Limelight.defaultOptions = {
    offset: 10,
  };

  document.addEventListener('DOMContentLoaded', () => {
    const boxGrad = new Limelight(document.querySelectorAll('.box__thing'));
    console.log(boxGrad);
  });

})));
//# sourceMappingURL=bundle.js.map
