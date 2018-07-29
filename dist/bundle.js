(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Limelight = factory());
}(this, (function () { 'use strict';

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject;

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  var _freeGlobal = freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = _freeGlobal || freeSelf || Function('return this')();

  var _root = root;

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
  var now = function() {
    return _root.Date.now();
  };

  var now_1 = now;

  /** Built-in value references. */
  var Symbol$1 = _root.Symbol;

  var _Symbol = Symbol$1;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Built-in value references. */
  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  var _getRawTag = getRawTag;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var _objectToString = objectToString;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag$1 && symToStringTag$1 in Object(value))
      ? _getRawTag(value)
      : _objectToString(value);
  }

  var _baseGetTag = baseGetTag;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  var isObjectLike_1 = isObjectLike;

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
  }

  var isSymbol_1 = isSymbol;

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol_1(value)) {
      return NAN;
    }
    if (isObject_1(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject_1(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var toNumber_1 = toNumber;

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber_1(wait) || 0;
    if (isObject_1(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber_1(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now_1();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now_1());
    }

    function debounced() {
      var time = now_1(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  var debounce_1 = debounce;

  /** Error message constants. */
  var FUNC_ERROR_TEXT$1 = 'Expected a function';

  /**
   * Creates a throttled function that only invokes `func` at most once per
   * every `wait` milliseconds. The throttled function comes with a `cancel`
   * method to cancel delayed `func` invocations and a `flush` method to
   * immediately invoke them. Provide `options` to indicate whether `func`
   * should be invoked on the leading and/or trailing edge of the `wait`
   * timeout. The `func` is invoked with the last arguments provided to the
   * throttled function. Subsequent calls to the throttled function return the
   * result of the last `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the throttled function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.throttle` and `_.debounce`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to throttle.
   * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=true]
   *  Specify invoking on the leading edge of the timeout.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * // Avoid excessively updating the position while scrolling.
   * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
   *
   * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
   * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
   * jQuery(element).on('click', throttled);
   *
   * // Cancel the trailing throttled invocation.
   * jQuery(window).on('popstate', throttled.cancel);
   */
  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }
    if (isObject_1(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce_1(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  var throttle_1 = throttle;

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

  var options = {
      offset: 10,
      closeOnClick: true,
      classes: {
          window: 'limelight__window',
          activeClass: 'limelight--is-active',
      },
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

  var Implementation = /** @class */ (function () {
      function Implementation(target, options$$1) {
          if (options$$1 === void 0) { options$$1 = {}; }
          this.id = 'clipElem';
          this.loop = undefined;
          this.emitter = new EventEmitter();
          this.topOffset = window.pageYOffset;
          this.elems = {
              // Handle querySelector or querySelectorAll
              target: Array.isArray(target) ? Array.from(target) : [target],
              limelight: undefined,
              maskWindows: undefined,
          };
          this.positions = [];
          this.options = u.mergeOptions(options, options$$1);
          this.isOpen = false;
          this.caches = {
              targetSize: {
                  elems: undefined,
                  result: [],
              },
              targetQuery: {
                  elems: undefined,
                  result: undefined,
              },
          };
          this.on = this.on.bind(this);
          this.open = this.open.bind(this);
          this.refocus = this.refocus.bind(this);
          this.close = this.close.bind(this);
          this.reposition = throttle_1(this.reposition.bind(this), 300);
          this.repositionLoop = this.repositionLoop.bind(this);
          this.handleClick = this.handleClick.bind(this);
          this.observer = new MutationObserver(this.mutationCallback.bind(this));
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
          var _this = this;
          return "\n      <div class=\"limelight\" id=\"" + this.id + "\" aria-hidden>\n        " + this.elems.target.map(function (elem, i) { return "\n          <div class=\"" + _this.id + "-window limelight__window\" id=\"" + _this.id + "-window-" + i + "\"></div>\n        "; }).join('') + "\n      </div>\n    ";
      };
      /**
       * Takes a position object and adjusts it to accomodate optional offset.
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
      /**
       * A RAF loop that re-runs reposition if the scroll position has changed.
       *
       * @todo Re-add some kind of caching?
       */
      Implementation.prototype.repositionLoop = function () {
          this.reposition();
          this.loop = requestAnimationFrame(this.repositionLoop);
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
                      // @todo Check this with multiple targets
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
       * MutationObserver callback.
       */
      Implementation.prototype.mutationCallback = function (mutations) {
          var _this = this;
          mutations.forEach(function (mutation) {
              // Check if the mutation is one we caused ourselves.
              if (!_this.elems.maskWindows.find(function (target) { return target === mutation.target; })) {
                  _this.reposition();
              }
          });
      };
      /**
       * Enables/disables event listeners.
       */
      Implementation.prototype.listeners = function (enable) {
          if (enable === void 0) { enable = true; }
          if (enable) {
              this.observer.observe(document, {
                  attributes: true,
                  childList: true,
                  subtree: true,
              });
              window.addEventListener('resize', this.reposition);
              window.addEventListener('scroll', this.reposition);
          }
          else {
              this.observer.disconnect();
              window.removeEventListener('resize', this.reposition);
              window.removeEventListener('scroll', this.reposition);
          }
      };
      /**
       * Runs setup.
       */
      Implementation.prototype.init = function () {
          var svgElem = this.createBGElem();
          this.elems.limelight = svgElem.querySelector("#" + this.id);
          this.elems.maskWindows = Array.from(svgElem.querySelectorAll("." + this.id + "-window"));
          document.body.appendChild(svgElem);
          this.reposition();
      };
      /**
       * Destroys the instance and cleans up.
       */
      Implementation.prototype.destroy = function () {
          if (this.loop)
              cancelAnimationFrame(this.loop);
          this.elems.limelight.parentNode.removeChild(this.elems.limelight);
      };
      /**
       * Resets the position on the windows.
       */
      Implementation.prototype.reposition = function () {
          var _this = this;
          console.log('reposition');
          this.elems.maskWindows.forEach(function (mask, i) {
              var first = _this.calculateOffsets(_this.elems.target[i].getBoundingClientRect());
              mask.style.left = first.left + "px";
              mask.style.top = first.top + "px";
              mask.style.width = first.width + "px";
              mask.style.height = first.height + "px";
              var last = _this.calculateOffsets(_this.elems.target[i].getBoundingClientRect());
              // Invert: determine the delta between the 
              // first and last bounds to invert the element
              var deltaX = first.left - last.left;
              var deltaY = first.top - last.top;
              var deltaW = first.width / last.width;
              var deltaH = first.height / last.height;
              mask.style.transformOrigin = 'top left';
              mask.style.transform = "translate(" + deltaX + "px, " + deltaY + "px) scale(" + deltaW + ", " + deltaH + ")";
              _this.elems.target[i].getBoundingClientRect();
              mask.style.transform = '';
          });
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
          // This is safeguard for when the event is not passed in and thus propgation
          // can't be stopped.
          requestAnimationFrame(function () {
              document.addEventListener('click', _this.handleClick);
              // this.repositionLoop();
              _this.reposition();
              _this.elems.limelight.classList.add(_this.options.classes.activeClass);
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
          document.removeEventListener('click', this.handleClick);
          cancelAnimationFrame(this.loop);
          this.listeners(false);
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
          this.elems.target = Array.isArray(target) ? Array.from(target) : [target];
          this.reposition();
      };
      return Implementation;
  }());

  var publicAPI = ['on', 'open', 'refocus', 'destroy', 'reposition'];
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
//# sourceMappingURL=bundle.js.map
