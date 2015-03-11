(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/phoenix/web/lorem-ipsum-component/index.js":[function(require,module,exports){
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

},{"lorem-ipsum":"/home/phoenix/web/lorem-ipsum-component/node_modules/lorem-ipsum/lib/generator.js"}],"/home/phoenix/web/lorem-ipsum-component/node_modules/lorem-ipsum/lib/dictionary.js":[function(require,module,exports){
var dictionary = {
  words: [
    'ad',
    'adipisicing',
    'aliqua',
    'aliquip',
    'amet',
    'anim',
    'aute',
    'cillum',
    'commodo',
    'consectetur',
    'consequat',
    'culpa',
    'cupidatat',
    'deserunt',
    'do',
    'dolor',
    'dolore',
    'duis',
    'ea',
    'eiusmod',
    'elit',
    'enim',
    'esse',
    'est',
    'et',
    'eu',
    'ex',
    'excepteur',
    'exercitation',
    'fugiat',
    'id',
    'in',
    'incididunt',
    'ipsum',
    'irure',
    'labore',
    'laboris',
    'laborum',
    'Lorem',
    'magna',
    'minim',
    'mollit',
    'nisi',
    'non',
    'nostrud',
    'nulla',
    'occaecat',
    'officia',
    'pariatur',
    'proident',
    'qui',
    'quis',
    'reprehenderit',
    'sint',
    'sit',
    'sunt',
    'tempor',
    'ullamco',
    'ut',
    'velit',
    'veniam',
    'voluptate'  
  ]
};

module.exports = dictionary;
},{}],"/home/phoenix/web/lorem-ipsum-component/node_modules/lorem-ipsum/lib/generator.js":[function(require,module,exports){
var generator = function() {
  var options = (arguments.length) ? arguments[0] : {}
    , count = options.count || 1
    , units = options.units || 'sentences'
    , sentenceLowerBound = options.sentenceLowerBound || 5
    , sentenceUpperBound = options.sentenceUpperBound || 15
	  , paragraphLowerBound = options.paragraphLowerBound || 3
	  , paragraphUpperBound = options.paragraphUpperBound || 7
	  , format = options.format || 'plain'
    , words = options.words || require('./dictionary').words
    , random = options.random || Math.random;

  units = simplePluralize(units.toLowerCase());

  var randomInteger = function(min, max) {
    return Math.floor(random() * (max - min + 1) + min);
  };
  
  var randomWord = function(words) {
    return words[randomInteger(0, words.length - 1)];
  };
  
  var randomSentence = function(words, lowerBound, upperBound) {
    var sentence = ''
      , bounds = {min: 0, max: randomInteger(lowerBound, upperBound)};
    
    while (bounds.min < bounds.max) {
      sentence = sentence + ' ' + randomWord(words);
      bounds.min = bounds.min + 1;
    }
    
    if (sentence.length) {
      sentence = sentence.slice(1);
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
  
    return sentence;
  };

  var randomParagraph = function(words, lowerBound, upperBound, sentenceLowerBound, sentenceUpperBound) {
    var paragraph = ''
      , bounds = {min: 0, max: randomInteger(lowerBound, upperBound)};
      
    while (bounds.min < bounds.max) {
      paragraph = paragraph + '. ' + randomSentence(words, sentenceLowerBound, sentenceUpperBound);
      bounds.min = bounds.min + 1;
    }
    
    if (paragraph.length) {
      paragraph = paragraph.slice(2);
      paragraph = paragraph + '.';
    }
    
    return paragraph;
  }
  
  var iter = 0
    , bounds = {min: 0, max: count}
    , string = ''
    , prefix = ''
    , suffix = "\r\n";

  if (format == 'html') {
    prefix = '<p>';
    suffix = '</p>';
  }
      
  while (bounds.min < bounds.max) {
    switch (units.toLowerCase()) {
      case 'words':
        string = string + ' ' + randomWord(words);
        break;
      case 'sentences':
        string = string + '. ' + randomSentence(words, sentenceLowerBound, sentenceUpperBound);
        break;
      case 'paragraphs':
        string = string + prefix + randomParagraph(words, paragraphLowerBound, paragraphUpperBound, sentenceLowerBound, sentenceUpperBound) + suffix;
        break;
    }
    bounds.min = bounds.min + 1;
  }
    
  if (string.length) {
    var pos = 0;
    
    if (string.indexOf('. ') == 0) {
      pos = 2;
    } else if (string.indexOf('.') == 0 || string.indexOf(' ') == 0) {
      pos = 1;
    }
    
    string = string.slice(pos);
    
    if (units == 'sentences') {
      string = string + '.';
    }
  }  
  
  return string;
};

function simplePluralize(string) {
  if (string.indexOf('s', string.length - 1) === -1) {
    return string + 's';
  }
  return string;
}

module.exports = generator;

},{"./dictionary":"/home/phoenix/web/lorem-ipsum-component/node_modules/lorem-ipsum/lib/dictionary.js"}]},{},["/home/phoenix/web/lorem-ipsum-component/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb3JlbS1pcHN1bS9saWIvZGljdGlvbmFyeS5qcyIsIm5vZGVfbW9kdWxlcy9sb3JlbS1pcHN1bS9saWIvZ2VuZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogbG9yZW0taXBzdW0tY29tcG9uZW50c1xuXG4gICBhIGN1c3RvbSBodG1sIGVsZW1lbnQgdGhhdCBnZW5lcmF0ZXMgbG9yZW0gaXBzdW0uXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuZXJhdGUgPSByZXF1aXJlKCdsb3JlbS1pcHN1bScpLFxuICAgbG9yZW1Qcm90byA9IE9iamVjdC5jcmVhdGUoSFRNTEVsZW1lbnQucHJvdG90eXBlKSxcbiAgIGRvYyA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQub3duZXJEb2N1bWVudCxcbiAgIGRlZmF1bHRzID0ge1xuICAgICAnY291bnQnOiAxLFxuICAgICAndW5pdHMnOiAncGFyYWdyYXBoJyxcbiAgICAgJ2Zvcm1hdCc6ICdodG1sJ1xuICAgfTtcblxuLyogc2V0IHVwIGdldHRlcnMgYW5kIHNldHRlcnMsXG4gICB0byBrZWVwIHByb3BlcnRpZXMgYW5kIGF0dHJpYnV0ZXMgaW4gc3luY1xuKi9cbk9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsb3JlbVByb3RvLCBwcm9wLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUocHJvcCkgfHwgZGVmYXVsdHNbcHJvcF07XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKHByb3AsIHZhbCk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG4vKiBleHBvc2UgYSByZW5kZXIoKSBtZXRob2RcbiAgIFJlbmRlcnMgdGhlIGxpcHN1bSBhc3luY2hyb25vdXNseSxcbiAgIGluIGNhc2UgYXR0cmlidXRlIGNoYW5nZXMgY2FuIGJlIGJhdGNoZWQuXG4gICAoY2FzdWFsIHRlc3Rpbmcgc3VnZ2VzdHMgdGhleSBjYW4ndC4pXG4gICBOb3Qgc3VyZSB3aHkgb25lIG1pZ2h0IGNhbGwgc2V0QXR0cmlidXRlXG4gICBhIG1pbGxpb24gdGltZXMgYSBzZWNvbmQsIGJ1dCB0aGV5IG1pZ2h0LlxuKi9cbmxvcmVtUHJvdG8ucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fdCAhPT0gbnVsbCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZXEpO1xuICB9XG4gIHRoaXMuX3QgPSBzZXRUaW1lb3V0KCAoZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucm9vdC5pbm5lckhUTUwgPSBnZW5lcmF0ZSh7XG4gICAgICBjb3VudDogdGhpcy5jb3VudCxcbiAgICAgIHVuaXRzOiB0aGlzLnVuaXRzLFxuICAgICAgZm9ybWF0OiB0aGlzLmZvcm1hdFxuICAgIH0pO1xuICAgIHRoaXMuX3QgPSBudWxsO1xuICB9KS5iaW5kKHRoaXMpLCAwICk7XG59O1xuXG5sb3JlbVByb3RvLmNyZWF0ZWRDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgdGVtcGxhdGUgPSBkb2MucXVlcnlTZWxlY3RvcignI2xvcmVtLWlwc3VtLXRlbXBsYXRlJyksXG4gICAgICBjbG9uZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgLyogaW5pdGlhbGl6ZSB3aXRoIGRlZmF1bHRzICovXG4gIE9iamVjdC5rZXlzKGRlZmF1bHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgdGhhdFtwcm9wXSA9IHRoYXQuZ2V0QXR0cmlidXRlKHByb3ApIHx8IGRlZmF1bHRzW3Byb3BdO1xuICB9KTtcblxuICB0aGlzLnJvb3QgPSB0aGlzLmNyZWF0ZVNoYWRvd1Jvb3QoKTtcbiAgdGhpcy5yb290LmFwcGVuZENoaWxkKGNsb25lKTtcblxuICAvKiBnZW5lcmF0ZSBzb21lIGxpcHN1bSAqL1xuICB0aGlzLnJlbmRlcigpO1xufTtcblxubG9yZW1Qcm90by5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMucmVuZGVyKCk7XG59O1xuXG5kb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2xvcmVtLWlwc3VtJywgeyBwcm90b3R5cGU6IGxvcmVtUHJvdG8gfSk7XG4iLCJ2YXIgZGljdGlvbmFyeSA9IHtcbiAgd29yZHM6IFtcbiAgICAnYWQnLFxuICAgICdhZGlwaXNpY2luZycsXG4gICAgJ2FsaXF1YScsXG4gICAgJ2FsaXF1aXAnLFxuICAgICdhbWV0JyxcbiAgICAnYW5pbScsXG4gICAgJ2F1dGUnLFxuICAgICdjaWxsdW0nLFxuICAgICdjb21tb2RvJyxcbiAgICAnY29uc2VjdGV0dXInLFxuICAgICdjb25zZXF1YXQnLFxuICAgICdjdWxwYScsXG4gICAgJ2N1cGlkYXRhdCcsXG4gICAgJ2Rlc2VydW50JyxcbiAgICAnZG8nLFxuICAgICdkb2xvcicsXG4gICAgJ2RvbG9yZScsXG4gICAgJ2R1aXMnLFxuICAgICdlYScsXG4gICAgJ2VpdXNtb2QnLFxuICAgICdlbGl0JyxcbiAgICAnZW5pbScsXG4gICAgJ2Vzc2UnLFxuICAgICdlc3QnLFxuICAgICdldCcsXG4gICAgJ2V1JyxcbiAgICAnZXgnLFxuICAgICdleGNlcHRldXInLFxuICAgICdleGVyY2l0YXRpb24nLFxuICAgICdmdWdpYXQnLFxuICAgICdpZCcsXG4gICAgJ2luJyxcbiAgICAnaW5jaWRpZHVudCcsXG4gICAgJ2lwc3VtJyxcbiAgICAnaXJ1cmUnLFxuICAgICdsYWJvcmUnLFxuICAgICdsYWJvcmlzJyxcbiAgICAnbGFib3J1bScsXG4gICAgJ0xvcmVtJyxcbiAgICAnbWFnbmEnLFxuICAgICdtaW5pbScsXG4gICAgJ21vbGxpdCcsXG4gICAgJ25pc2knLFxuICAgICdub24nLFxuICAgICdub3N0cnVkJyxcbiAgICAnbnVsbGEnLFxuICAgICdvY2NhZWNhdCcsXG4gICAgJ29mZmljaWEnLFxuICAgICdwYXJpYXR1cicsXG4gICAgJ3Byb2lkZW50JyxcbiAgICAncXVpJyxcbiAgICAncXVpcycsXG4gICAgJ3JlcHJlaGVuZGVyaXQnLFxuICAgICdzaW50JyxcbiAgICAnc2l0JyxcbiAgICAnc3VudCcsXG4gICAgJ3RlbXBvcicsXG4gICAgJ3VsbGFtY28nLFxuICAgICd1dCcsXG4gICAgJ3ZlbGl0JyxcbiAgICAndmVuaWFtJyxcbiAgICAndm9sdXB0YXRlJyAgXG4gIF1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGljdGlvbmFyeTsiLCJ2YXIgZ2VuZXJhdG9yID0gZnVuY3Rpb24oKSB7XG4gIHZhciBvcHRpb25zID0gKGFyZ3VtZW50cy5sZW5ndGgpID8gYXJndW1lbnRzWzBdIDoge31cbiAgICAsIGNvdW50ID0gb3B0aW9ucy5jb3VudCB8fCAxXG4gICAgLCB1bml0cyA9IG9wdGlvbnMudW5pdHMgfHwgJ3NlbnRlbmNlcydcbiAgICAsIHNlbnRlbmNlTG93ZXJCb3VuZCA9IG9wdGlvbnMuc2VudGVuY2VMb3dlckJvdW5kIHx8IDVcbiAgICAsIHNlbnRlbmNlVXBwZXJCb3VuZCA9IG9wdGlvbnMuc2VudGVuY2VVcHBlckJvdW5kIHx8IDE1XG5cdCAgLCBwYXJhZ3JhcGhMb3dlckJvdW5kID0gb3B0aW9ucy5wYXJhZ3JhcGhMb3dlckJvdW5kIHx8IDNcblx0ICAsIHBhcmFncmFwaFVwcGVyQm91bmQgPSBvcHRpb25zLnBhcmFncmFwaFVwcGVyQm91bmQgfHwgN1xuXHQgICwgZm9ybWF0ID0gb3B0aW9ucy5mb3JtYXQgfHwgJ3BsYWluJ1xuICAgICwgd29yZHMgPSBvcHRpb25zLndvcmRzIHx8IHJlcXVpcmUoJy4vZGljdGlvbmFyeScpLndvcmRzXG4gICAgLCByYW5kb20gPSBvcHRpb25zLnJhbmRvbSB8fCBNYXRoLnJhbmRvbTtcblxuICB1bml0cyA9IHNpbXBsZVBsdXJhbGl6ZSh1bml0cy50b0xvd2VyQ2FzZSgpKTtcblxuICB2YXIgcmFuZG9tSW50ZWdlciA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IocmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgKyBtaW4pO1xuICB9O1xuICBcbiAgdmFyIHJhbmRvbVdvcmQgPSBmdW5jdGlvbih3b3Jkcykge1xuICAgIHJldHVybiB3b3Jkc1tyYW5kb21JbnRlZ2VyKDAsIHdvcmRzLmxlbmd0aCAtIDEpXTtcbiAgfTtcbiAgXG4gIHZhciByYW5kb21TZW50ZW5jZSA9IGZ1bmN0aW9uKHdvcmRzLCBsb3dlckJvdW5kLCB1cHBlckJvdW5kKSB7XG4gICAgdmFyIHNlbnRlbmNlID0gJydcbiAgICAgICwgYm91bmRzID0ge21pbjogMCwgbWF4OiByYW5kb21JbnRlZ2VyKGxvd2VyQm91bmQsIHVwcGVyQm91bmQpfTtcbiAgICBcbiAgICB3aGlsZSAoYm91bmRzLm1pbiA8IGJvdW5kcy5tYXgpIHtcbiAgICAgIHNlbnRlbmNlID0gc2VudGVuY2UgKyAnICcgKyByYW5kb21Xb3JkKHdvcmRzKTtcbiAgICAgIGJvdW5kcy5taW4gPSBib3VuZHMubWluICsgMTtcbiAgICB9XG4gICAgXG4gICAgaWYgKHNlbnRlbmNlLmxlbmd0aCkge1xuICAgICAgc2VudGVuY2UgPSBzZW50ZW5jZS5zbGljZSgxKTtcbiAgICAgIHNlbnRlbmNlID0gc2VudGVuY2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzZW50ZW5jZS5zbGljZSgxKTtcbiAgICB9XG4gIFxuICAgIHJldHVybiBzZW50ZW5jZTtcbiAgfTtcblxuICB2YXIgcmFuZG9tUGFyYWdyYXBoID0gZnVuY3Rpb24od29yZHMsIGxvd2VyQm91bmQsIHVwcGVyQm91bmQsIHNlbnRlbmNlTG93ZXJCb3VuZCwgc2VudGVuY2VVcHBlckJvdW5kKSB7XG4gICAgdmFyIHBhcmFncmFwaCA9ICcnXG4gICAgICAsIGJvdW5kcyA9IHttaW46IDAsIG1heDogcmFuZG9tSW50ZWdlcihsb3dlckJvdW5kLCB1cHBlckJvdW5kKX07XG4gICAgICBcbiAgICB3aGlsZSAoYm91bmRzLm1pbiA8IGJvdW5kcy5tYXgpIHtcbiAgICAgIHBhcmFncmFwaCA9IHBhcmFncmFwaCArICcuICcgKyByYW5kb21TZW50ZW5jZSh3b3Jkcywgc2VudGVuY2VMb3dlckJvdW5kLCBzZW50ZW5jZVVwcGVyQm91bmQpO1xuICAgICAgYm91bmRzLm1pbiA9IGJvdW5kcy5taW4gKyAxO1xuICAgIH1cbiAgICBcbiAgICBpZiAocGFyYWdyYXBoLmxlbmd0aCkge1xuICAgICAgcGFyYWdyYXBoID0gcGFyYWdyYXBoLnNsaWNlKDIpO1xuICAgICAgcGFyYWdyYXBoID0gcGFyYWdyYXBoICsgJy4nO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcGFyYWdyYXBoO1xuICB9XG4gIFxuICB2YXIgaXRlciA9IDBcbiAgICAsIGJvdW5kcyA9IHttaW46IDAsIG1heDogY291bnR9XG4gICAgLCBzdHJpbmcgPSAnJ1xuICAgICwgcHJlZml4ID0gJydcbiAgICAsIHN1ZmZpeCA9IFwiXFxyXFxuXCI7XG5cbiAgaWYgKGZvcm1hdCA9PSAnaHRtbCcpIHtcbiAgICBwcmVmaXggPSAnPHA+JztcbiAgICBzdWZmaXggPSAnPC9wPic7XG4gIH1cbiAgICAgIFxuICB3aGlsZSAoYm91bmRzLm1pbiA8IGJvdW5kcy5tYXgpIHtcbiAgICBzd2l0Y2ggKHVuaXRzLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ3dvcmRzJzpcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nICsgJyAnICsgcmFuZG9tV29yZCh3b3Jkcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VudGVuY2VzJzpcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nICsgJy4gJyArIHJhbmRvbVNlbnRlbmNlKHdvcmRzLCBzZW50ZW5jZUxvd2VyQm91bmQsIHNlbnRlbmNlVXBwZXJCb3VuZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGFyYWdyYXBocyc6XG4gICAgICAgIHN0cmluZyA9IHN0cmluZyArIHByZWZpeCArIHJhbmRvbVBhcmFncmFwaCh3b3JkcywgcGFyYWdyYXBoTG93ZXJCb3VuZCwgcGFyYWdyYXBoVXBwZXJCb3VuZCwgc2VudGVuY2VMb3dlckJvdW5kLCBzZW50ZW5jZVVwcGVyQm91bmQpICsgc3VmZml4O1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgYm91bmRzLm1pbiA9IGJvdW5kcy5taW4gKyAxO1xuICB9XG4gICAgXG4gIGlmIChzdHJpbmcubGVuZ3RoKSB7XG4gICAgdmFyIHBvcyA9IDA7XG4gICAgXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKCcuICcpID09IDApIHtcbiAgICAgIHBvcyA9IDI7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcuaW5kZXhPZignLicpID09IDAgfHwgc3RyaW5nLmluZGV4T2YoJyAnKSA9PSAwKSB7XG4gICAgICBwb3MgPSAxO1xuICAgIH1cbiAgICBcbiAgICBzdHJpbmcgPSBzdHJpbmcuc2xpY2UocG9zKTtcbiAgICBcbiAgICBpZiAodW5pdHMgPT0gJ3NlbnRlbmNlcycpIHtcbiAgICAgIHN0cmluZyA9IHN0cmluZyArICcuJztcbiAgICB9XG4gIH0gIFxuICBcbiAgcmV0dXJuIHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIHNpbXBsZVBsdXJhbGl6ZShzdHJpbmcpIHtcbiAgaWYgKHN0cmluZy5pbmRleE9mKCdzJywgc3RyaW5nLmxlbmd0aCAtIDEpID09PSAtMSkge1xuICAgIHJldHVybiBzdHJpbmcgKyAncyc7XG4gIH1cbiAgcmV0dXJuIHN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5lcmF0b3I7XG4iXX0=
