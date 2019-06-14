!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Limelight=e()}(this,function(){"use strict";var t={mergeOptions:function(t={},e={}){return Object.keys(t).reduce((i,n)=>Object.assign(i,{[n]:void 0!==e[n]?e[n]:t[n]}),{})},uid:function(){return Math.random().toString(36).substr(2,9)}},e={offset:10,closeOnClick:!0,classes:{window:"limelight__window",activeClass:"limelight--is-active"},styles:{}},i=function(t,e){return(i=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])})(t,e)};function n(t,e){function n(){this.constructor=t}i(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}var o=function(){function t(t,e){void 0===e&&(e={}),this.eventType=t,this.payload=e}return Object.defineProperty(t.prototype,"type",{get:function(){if(!this.eventType)throw new Error("Not implemented.");return this.eventType},set:function(t){this.eventType||(this.eventType=t)},enumerable:!0,configurable:!0}),t}(),s=function(t){function e(){for(var e=[],i=0;i<arguments.length;i++)e[i]=arguments[i];return t.apply(this,["close"].concat(e))||this}return n(e,t),e}(o),r=function(t){function e(){for(var e=[],i=0;i<arguments.length;i++)e[i]=arguments[i];return t.apply(this,["open"].concat(e))||this}return n(e,t),e}(o),a=function(){function t(){this.callbacks={}}return t.prototype.on=function(t,e){var i;this.callbacks=Object.assign({},this.callbacks,((i={})[t]=(this.callbacks[t]||[]).concat([e]),i))},t.prototype.trigger=function(t){if(t instanceof o){var e=this.callbacks[t.type];e&&e.forEach(function(e){try{e(t)}catch(t){console.error(t)}})}else console.error("Not a valid GenericEvent instance.",t)},t}(),c=function(){function i(i,n,o){void 0===o&&(o={}),this.id="clipElem-"+t.uid(),this.emitter=new a,this.elems={target:Array.isArray(i)?Array.from(i):[i],limelight:void 0,maskWindows:void 0,wrapper:n},this.observer=new MutationObserver(this.mutationCallback.bind(this)),this.options=t.mergeOptions(e,o),this.isOpen=!1,this.caches={targetQuery:{elems:void 0,result:void 0}},this.on=this.on.bind(this),this.open=this.open.bind(this),this.refocus=this.refocus.bind(this),this.destroy=this.destroy.bind(this),this.close=this.close.bind(this),this.reposition=this.reposition.bind(this),this.handleClick=this.handleClick.bind(this),this.init()}return i.prototype.createBGElem=function(){return document.createRange().createContextualFragment(this.renderOverlay())},i.prototype.renderOverlay=function(){var t=this,e=this.options.styles,i=void 0===e?{}:e,n=[i.bg&&"--limelight-bg: "+i.bg,i.overlayTransitionDuration&&"--limelight-overlay-transition-duration: "+i.overlayTransitionDuration,i.windowTransitionDuration&&"--limelight-window-transition-duration: "+i.windowTransitionDuration,i.zIndex&&"--limelight-z-index: "+i.zIndex];return'\n      <div \n        class="limelight"\n        id="'+this.id+'"\n        style="'+n.filter(Boolean).join(" ")+'"\n        aria-hidden\n      >\n        '+this.elems.target.map(function(e,i){return'\n          <div class="'+t.id+'-window limelight__window" id="'+t.id+"-window-"+i+'"></div>\n        '}).join("")+"\n      </div>\n    "},i.prototype.calculateOffsets=function(t){var e=this.options.offset;return{left:t.left-e,top:t.top-e,width:t.width+2*e,height:t.height+2*e}},Object.defineProperty(i.prototype,"targetQuery",{get:function(){return this.caches.targetQuery.elems!==this.elems.target&&(this.caches.targetQuery.elems=this.elems.target,this.caches.targetQuery.result=this.elems.target.reduce(function(t,e){var i=""+(e.id?"#"+e.id:"")+Array.from(e.classList).slice().map(function(t){return"."+t}).join("");return t+" "+i+", "+i+" *"},"")),this.caches.targetQuery.result},enumerable:!0,configurable:!0}),i.prototype.handleClick=function(t){this.options.closeOnClick&&(t.target.matches(this.targetQuery)||this.close())},i.prototype.init=function(){var t=this.createBGElem();this.elems.limelight=t.querySelector("#"+this.id),this.elems.maskWindows=Array.from(t.querySelectorAll("."+this.id+"-window")),this.elems.wrapper.appendChild(t),this.reposition()},i.prototype.mutationCallback=function(t){var e=this;t.forEach(function(t){t.target===e.elems.svg||e.elems.maskWindows.find(function(e){return e===t.target})||e.reposition()})},i.prototype.listeners=function(t){void 0===t&&(t=!0),t?(this.observer.observe(document,{attributes:!0,childList:!0,subtree:!0}),document.body.style.cursor="pointer",window.addEventListener("resize",this.reposition),document.addEventListener("click",this.handleClick)):(this.observer.disconnect(),document.body.style.cursor="",window.removeEventListener("resize",this.reposition),document.removeEventListener("click",this.handleClick))},i.prototype.destroy=function(){this.elems.limelight.parentNode.removeChild(this.elems.limelight)},i.prototype.reposition=function(){var t=this;this.elems.maskWindows.forEach(function(e,i){var n=t.calculateOffsets(t.elems.target[i].getBoundingClientRect());e.style.transform="\n        translate("+n.left+"px, "+(n.top+window.scrollY)+"px)\n        scale("+n.width+", "+n.height+")\n      "})},i.prototype.open=function(t){var e=this;this.isOpen||(this.isOpen=!0,t&&t.target&&t.stopPropagation(),this.emitter.trigger(new r),requestAnimationFrame(function(){e.reposition(),requestAnimationFrame(function(){e.elems.limelight.classList.add(e.options.classes.activeClass)}),e.listeners()}))},i.prototype.close=function(){this.isOpen&&(this.isOpen=!1,this.elems.limelight.classList.remove(this.options.classes.activeClass),this.emitter.trigger(new s),this.listeners(!1))},i.prototype.on=function(t,e){this.emitter.on(t,e)},i.prototype.refocus=function(t){this.elems.target=Array.isArray(t)?Array.from(t):[t],this.reposition()},i}(),l=["on","open","refocus","destroy","reposition"];return function(){return function(t,e,i){var n=this,o=new c(t,e,i);l.forEach(function(t){n[t]=o[t]})}}()});
//# sourceMappingURL=index.js.map
