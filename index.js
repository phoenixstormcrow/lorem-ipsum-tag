/* lorem-ipsum-components

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

/* expose a render() method
   Renders the lipsum asynchronously,
   in case attribute changes can be batched.
   (casual testing suggests they can't.)
   Not sure why one might call setAttribute
   a million times a second, but they might.
*/
loremProto.render = function () {
  if (this._t !== null) {
    clearTimeout(this._req);
  }
  this._t = setTimeout( (function () {
    this.root.innerHTML = generate({
      count: this.count,
      units: this.units,
      format: this.format
    });
    this._t = null;
  }).bind(this), 0 );
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
