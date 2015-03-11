/* lorem-ipsum-tag

   a custom html element that generates lorem ipsum.
*/
'use strict';

var generate = require('lorem-ipsum'),
   loremProto = Object.create(HTMLElement.prototype),
   doc = document.currentScript.ownerDocument,
   defaults = {
     'count': 1,
     'units': 'paragraph',
     'format': 'html'
   };

/* set up getters and setters,
   to keep properties and attributes in sync
*/
Object.keys(defaults).forEach(function (prop) {
  Object.defineProperty(loremProto, prop, {
    get: function () {
      return this.getAttribute(prop) || defaults[prop];
    },
    set: function (val) {
      this.setAttribute(prop, val);
    }
  });
});

/* .render()
   Generates and renders the text asynchronously.
   The user can call .setAttribute() or .render()
   10000 times in a loop, but we're only going to actually
   generate and render once. See perf.png for demo.
*/
loremProto.render = function () {
//  console.log('render');
  if (this._t !== null) {
    clearTimeout(this._t);
  }
  this._t = setTimeout( function () {
//    console.log('rendering');
    this.root.innerHTML = generate({
      count: this.count,
      units: this.units,
      format: this.format
    });
    this._t = null;
  }.bind(this), 0 );
};

loremProto.createdCallback = function () {
  var that = this,
      template = doc.querySelector('#lorem-ipsum-template'),
      clone = document.importNode(template.content, true);

  /* initialize with defaults */
  Object.keys(defaults).forEach(function (prop) {
    that[prop] = that.getAttribute(prop) || defaults[prop];
  });

  this.root = this.createShadowRoot();
  this.root.appendChild(clone);

  /* generate some lipsum */
  this.render();
};

loremProto.attributeChangedCallback = function () {
  this.render();
};

document.registerElement('lorem-ipsum', { prototype: loremProto });
