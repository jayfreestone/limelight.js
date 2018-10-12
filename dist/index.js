(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Limelight = factory());
}(this, (function () { 'use strict';

  function mergeOptions(defaultOptions = {}, userOptions = {}) {
    return Object.keys(defaultOptions)
      .reduce((obj, key) => (
        Object.assign(obj, {
          [key]: userOptions[key] !== undefined
            ? userOptions[key]
            : defaultOptions[key],
        })
      ), {});
  }

  function uid() {
    return Math.random().toString(36).substr(2, 9);
  }

  var u = {
    mergeOptions,
    uid,
  };

  var options = {
      offset: 10,
      closeOnClick: true,
      classes: {
          window: 'limelight__window',
          activeClass: 'limelight--is-active',
      },
      styles: {},
  };

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  /**
   * The base 'event' class used by an EventEmitter.
   */
  var GenericEvent = /** @class */ (function () {
      /**
       * @param eventType - The 'type' that will be listened for.
       * @param payload - Any additional data.
       */
      function GenericEvent(eventType, payload) {
          if (payload === void 0) { payload = {}; }
          this.eventType = eventType;
          this.payload = payload;
      }
      Object.defineProperty(GenericEvent.prototype, "type", {
          /**
           * @return string;
           */
          get: function () {
              if (!this.eventType) {
                  throw new Error('Not implemented.');
              }
              return this.eventType;
          },
          set: function (eventType) {
              // Do not allow re-assignment
              if (this.eventType)
                  return;
              this.eventType = eventType;
          },
          enumerable: true,
          configurable: true
      });
      return GenericEvent;
  }());

  /**
   * Indicates the instance has been closed.
   */
  var CloseEvent = /** @class */ (function (_super) {
      __extends(CloseEvent, _super);
      function CloseEvent() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return _super.apply(this, ['close'].concat(args)) || this;
      }
      return CloseEvent;
  }(GenericEvent));

  /**
   * Indicates the instance has opened.
   */
  var OpenEvent = /** @class */ (function (_super) {
      __extends(OpenEvent, _super);
      function OpenEvent() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return _super.apply(this, ['open'].concat(args)) || this;
      }
      return OpenEvent;
  }(GenericEvent));

  /**
   * Allows registration of callbacks that will be triggered on specific events.
   */
  var EventEmitter = /** @class */ (function () {
      function EventEmitter() {
          this.callbacks = {};
      }
      /**
       * Used to listen for an event and fire a callback.
       *
       * @param type - The event type, will need to match an existing type.
       * @param callback - The callback function to run.
       */
      EventEmitter.prototype.on = function (type, callback) {
          var _a;
          this.callbacks = Object.assign({}, this.callbacks, (_a = {},
              _a[type] = (this.callbacks[type] || []).concat([callback]),
              _a));
      };
      /**
       * Takes an event (e.g. Open) and fires the callbacks for it.
       *
       * @param event - The event type.
       * @example emitter.trigger(new OpenEvent());
       */
      EventEmitter.prototype.trigger = function (event) {
          if (!(event instanceof GenericEvent)) {
              console.error('Not a valid GenericEvent instance.', event);
              return;
          }
          var callbacks = this.callbacks[event.type];
          if (!callbacks)
              return;
          callbacks.forEach(function (cb) {
              try {
                  cb(event);
              }
              catch (e) {
                  console.error(e);
              }
          });
      };
      return EventEmitter;
  }());

  /**
   * Main library class.
   */
  var Implementation = /** @class */ (function () {
      function Implementation(target, options$$1) {
          if (options$$1 === void 0) { options$$1 = {}; }
          this.id = "clipElem-" + u.uid();
          this.emitter = new EventEmitter();
          this.elems = {
              // Handle querySelector or querySelectorAll
              target: Array.isArray(target) ? Array.from(target) : [target],
              canvas: undefined,
              ctx: undefined,
              limelight: undefined,
              maskWindows: undefined,
          };
          // this.observer = new MutationObserver(this.mutationCallback.bind(this));
          this.options = u.mergeOptions(options, options$$1);
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
          this.tick = this.tick.bind(this);
          this.init();
      }
      /**
       * Create an Document Fragment based on an overlay string
       */
      Implementation.prototype.createBGElem = function () {
          return document.createRange().createContextualFragment(this.renderOverlay());
      };
      /**
       * Creates a string that represents gradient stop points.
       */
      Implementation.prototype.renderOverlay = function () {
          var _a = this.options.styles, styles = _a === void 0 ? {} : _a;
          /**
           * Custom properties passed in as options are applied inline. If it has
           * been passed in we use to to populate the array and generate the
           * inline style attribute.
           */
          var inlineVars = [
              styles.bg &&
                  "--limelight-bg: " + styles.bg,
              styles.overlayTransitionDuration &&
                  "--limelight-overlay-transition-duration: " + styles.overlayTransitionDuration,
              styles.windowTransitionDuration &&
                  "--limelight-window-transition-duration: " + styles.windowTransitionDuration,
              styles.zIndex &&
                  "--limelight-z-index: " + styles.zIndex,
          ];
          return "\n      <div \n        class=\"limelight\"\n        id=\"" + this.id + "\"\n        style=\"" + inlineVars.filter(Boolean).join(' ') + "\"\n        aria-hidden\n      >\n        <canvas></canvas>\n      </div>\n    ";
      };
      /**
       * Takes a position object and adjusts it to accommodate optional offset.
       *
       * @param position - The result of getClientBoundingRect()
       */
      Implementation.prototype.calculateOffsets = function (position) {
          var offset = this.options.offset;
          var left = position.left, top = position.top, width = position.width, height = position.height;
          return {
              left: left - offset,
              top: top - offset,
              width: width + (offset * 2),
              height: height + (offset * 2),
          };
      };
      Object.defineProperty(Implementation.prototype, "targetQuery", {
          /**
           * Extracts classes/ids from target elements to create a css selector.
           */
          get: function () {
              if (this.caches.targetQuery.elems !== this.elems.target) {
                  this.caches.targetQuery.elems = this.elems.target;
                  this.caches.targetQuery.result = this.elems.target.reduce(function (str, elem) {
                      var id = elem.id ? "#" + elem.id : '';
                      var classes = Array.from(elem.classList).slice().map(function (x) { return "." + x; }).join('');
                      var targetStr = "" + id + classes;
                      return str + " " + targetStr + ", " + targetStr + " *";
                  }, '');
              }
              return this.caches.targetQuery.result;
          },
          enumerable: true,
          configurable: true
      });
      /**
       * Closes the overlay if the click happens outside of one of the target elements.
       */
      Implementation.prototype.handleClick = function (e) {
          if (!this.options.closeOnClick)
              return;
          if (!e.target.matches(this.targetQuery)) {
              this.close();
          }
      };
      /**
       * Runs setup.
       */
      Implementation.prototype.init = function () {
          var svgElem = this.createBGElem();
          this.elems.limelight = svgElem.querySelector("#" + this.id);
          this.elems.canvas = svgElem.querySelector('canvas');
          this.elems.ctx = this.elems.canvas.getContext('2d');
          document.body.appendChild(svgElem);
          this.reposition();
      };
      Implementation.prototype.tick = function () {
          var _this = this;
          this.elems.ctx.globalCompositeOperation = 'xor';
          this.elems.ctx.clearRect(0, 0, this.elems.canvas.width, this.elems.canvas.height);
          this.elems.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          this.elems.ctx.fillRect(0, 0, this.getPageWidth(), this.getPageHeight());
          this.elems.target.forEach(function (target, i) {
              var pos = _this.calculateOffsets(target.getBoundingClientRect());
              _this.elems.ctx.fillStyle = '#fff';
              _this.elems.ctx.fillRect(Math.floor(pos.left), Math.floor(pos.top), Math.floor(pos.width), Math.floor(pos.height));
          });
          this.loop = requestAnimationFrame(this.tick);
      };
      Implementation.prototype.getPageHeight = function () {
          var body = document.body;
          var html = document.documentElement;
          return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      };
      Implementation.prototype.getPageWidth = function () {
          var body = document.body;
          var html = document.documentElement;
          return Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
      };
      /**
       * MutationObserver callback.
       */
      Implementation.prototype.mutationCallback = function (mutations) {
          // mutations.forEach(mutation => {
          //   // Check if the mutation is one we caused ourselves.
          //   if (mutation.target !== this.elems.svg && !this.elems.maskWindows.find(target => target === mutation.target)) {
          //     this.reposition();
          //   }
          // });
      };
      /**
       * Enables/disables event listeners.
       */
      Implementation.prototype.listeners = function (enable) {
          if (enable === void 0) { enable = true; }
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
          }
          else {
              // this.observer.disconnect();
              document.body.style.cursor = '';
              window.removeEventListener('resize', this.reposition);
              document.removeEventListener('click', this.handleClick);
          }
      };
      /**
       * Destroys the instance and cleans up.
       */
      Implementation.prototype.destroy = function () {
          cancelAnimationFrame(this.loop);
          this.elems.limelight.parentNode.removeChild(this.elems.limelight);
      };
      /**
       * Resets the position on the windows.
       */
      Implementation.prototype.reposition = function () {
          this.elems.canvas.setAttribute('height', this.elems.limelight.offsetHeight);
          this.elems.canvas.setAttribute('width', this.elems.limelight.offsetWidth);
      };
      /**
       * Open the overlay.
       */
      Implementation.prototype.open = function (e) {
          var _this = this;
          if (this.isOpen)
              return;
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
          requestAnimationFrame(function () {
              _this.loop = _this.tick();
              // Force active class to be applied after the 'paint' and calculation
              // of the reposition, or we risk the transition happening on first load.
              requestAnimationFrame(function () {
                  _this.elems.limelight.classList.add(_this.options.classes.activeClass);
              });
              _this.listeners();
          });
      };
      /**
       * Close the overlay.
       */
      Implementation.prototype.close = function () {
          if (!this.isOpen)
              return;
          this.isOpen = false;
          this.elems.limelight.classList.remove(this.options.classes.activeClass);
          this.emitter.trigger(new CloseEvent());
          this.listeners(false);
          cancelAnimationFrame(this.loop);
      };
      /**
       * Passes through the event to the emitter.
       */
      Implementation.prototype.on = function (event, callback) {
          this.emitter.on(event, callback);
      };
      /**
       * Change the window focus to a different element/set of elements.
       */
      Implementation.prototype.refocus = function (target) {
          this.start = this.calculateOffsets(target.getBoundingClientRect());
          this.elems.target = Array.isArray(target) ? Array.from(target) : [target];
          // this.reposition();
      };
      return Implementation;
  }());

  /**
   * Methods and properties to make public.
   */
  var publicAPI = ['on', 'open', 'refocus', 'destroy', 'reposition'];
  /**
   * Library Implementation with public API exposed.
   */
  var Limelight = /** @class */ (function () {
      function Limelight(target, options) {
          var _this = this;
          var implementation = new Implementation(target, options);
          publicAPI.forEach(function (prop) {
              _this[prop] = implementation[prop];
          });
      }
      return Limelight;
  }());

  // document.addEventListener('DOMContentLoaded', () => {
  //   // const targets = document.querySelectorAll('.box__thing');
  //   const targets = document.querySelector('.box__thing');
  //   const boxGrad = new Limelight(targets);

  //   document.querySelector('.js-start').addEventListener('click', (e) => {
  //     e.stopPropagation();
  //     e.preventDefault();
  //     boxGrad.open();
  //   });

  //   boxGrad.on('open', (e) => {
  //     console.log('opening', e);
  //   });

  //   boxGrad.on('close', (e) => {
  //     console.log('closing', e);
  //   });

  //   boxGrad.on('reposition', (e) => {
  //     console.log('repositioning', e);
  //   });


  //   setTimeout(() => {
  //     boxGrad.refocus(document.querySelector('.other-thing'));
  //   }, 2000);

  //   // targets.forEach(target => {
  //   //   target.addEventListener('open', () => {
  //   //     console.log('we are opening');
  //   //   });
  //   //   target.addEventListener('close', () => {
  //   //     console.log('we are closing');
  //   //   });
  //   // })

  //   console.log(boxGrad);
  // });

  return Limelight;

})));
//# sourceMappingURL=index.js.map
