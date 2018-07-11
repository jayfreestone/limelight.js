// @ts-check
import u from '../utils';

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
    this.bindListeners();
  }

  bindListeners() {
    window.addEventListener('scroll', this.reposition.bind(this));
  }
}

Limelight.defaultOptions = {
  offset: 10,
};

export default Limelight;
