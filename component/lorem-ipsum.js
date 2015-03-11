(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/phoenix/web/lorem-ipsum-tag/index.js":[function(require,module,exports){
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

},{"lorem-ipsum":"/home/phoenix/web/lorem-ipsum-tag/node_modules/lorem-ipsum/lib/generator.js"}],"/home/phoenix/web/lorem-ipsum-tag/node_modules/lorem-ipsum/lib/dictionary.js":[function(require,module,exports){
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
},{}],"/home/phoenix/web/lorem-ipsum-tag/node_modules/lorem-ipsum/lib/generator.js":[function(require,module,exports){
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

},{"./dictionary":"/home/phoenix/web/lorem-ipsum-tag/node_modules/lorem-ipsum/lib/dictionary.js"}]},{},["/home/phoenix/web/lorem-ipsum-tag/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9sb3JlbS1pcHN1bS9saWIvZGljdGlvbmFyeS5qcyIsIm5vZGVfbW9kdWxlcy9sb3JlbS1pcHN1bS9saWIvZ2VuZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBsb3JlbS1pcHN1bS10YWdcblxuICAgYSBjdXN0b20gaHRtbCBlbGVtZW50IHRoYXQgZ2VuZXJhdGVzIGxvcmVtIGlwc3VtLlxuKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGdlbmVyYXRlID0gcmVxdWlyZSgnbG9yZW0taXBzdW0nKSxcbiAgIGxvcmVtUHJvdG8gPSBPYmplY3QuY3JlYXRlKEhUTUxFbGVtZW50LnByb3RvdHlwZSksXG4gICBkb2MgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0Lm93bmVyRG9jdW1lbnQsXG4gICBkZWZhdWx0cyA9IHtcbiAgICAgJ2NvdW50JzogMSxcbiAgICAgJ3VuaXRzJzogJ3BhcmFncmFwaCcsXG4gICAgICdmb3JtYXQnOiAnaHRtbCdcbiAgIH07XG5cbi8qIHNldCB1cCBnZXR0ZXJzIGFuZCBzZXR0ZXJzLFxuICAgdG8ga2VlcCBwcm9wZXJ0aWVzIGFuZCBhdHRyaWJ1dGVzIGluIHN5bmNcbiovXG5PYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9yZW1Qcm90bywgcHJvcCwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKHByb3ApIHx8IGRlZmF1bHRzW3Byb3BdO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZShwcm9wLCB2YWwpO1xuICAgIH1cbiAgfSk7XG59KTtcblxuLyogLnJlbmRlcigpXG4gICBHZW5lcmF0ZXMgYW5kIHJlbmRlcnMgdGhlIHRleHQgYXN5bmNocm9ub3VzbHkuXG4gICBUaGUgdXNlciBjYW4gY2FsbCAuc2V0QXR0cmlidXRlKCkgb3IgLnJlbmRlcigpXG4gICAxMDAwMCB0aW1lcyBpbiBhIGxvb3AsIGJ1dCB3ZSdyZSBvbmx5IGdvaW5nIHRvIGFjdHVhbGx5XG4gICBnZW5lcmF0ZSBhbmQgcmVuZGVyIG9uY2UuIFNlZSBwZXJmLnBuZyBmb3IgZGVtby5cbiovXG5sb3JlbVByb3RvLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbi8vICBjb25zb2xlLmxvZygncmVuZGVyJyk7XG4gIGlmICh0aGlzLl90ICE9PSBudWxsKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3QpO1xuICB9XG4gIHRoaXMuX3QgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4vLyAgICBjb25zb2xlLmxvZygncmVuZGVyaW5nJyk7XG4gICAgdGhpcy5yb290LmlubmVySFRNTCA9IGdlbmVyYXRlKHtcbiAgICAgIGNvdW50OiB0aGlzLmNvdW50LFxuICAgICAgdW5pdHM6IHRoaXMudW5pdHMsXG4gICAgICBmb3JtYXQ6IHRoaXMuZm9ybWF0XG4gICAgfSk7XG4gICAgdGhpcy5fdCA9IG51bGw7XG4gIH0uYmluZCh0aGlzKSwgMCApO1xufTtcblxubG9yZW1Qcm90by5jcmVhdGVkQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgIHRlbXBsYXRlID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJyNsb3JlbS1pcHN1bS10ZW1wbGF0ZScpLFxuICAgICAgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gIC8qIGluaXRpYWxpemUgd2l0aCBkZWZhdWx0cyAqL1xuICBPYmplY3Qua2V5cyhkZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgIHRoYXRbcHJvcF0gPSB0aGF0LmdldEF0dHJpYnV0ZShwcm9wKSB8fCBkZWZhdWx0c1twcm9wXTtcbiAgfSk7XG5cbiAgdGhpcy5yb290ID0gdGhpcy5jcmVhdGVTaGFkb3dSb290KCk7XG4gIHRoaXMucm9vdC5hcHBlbmRDaGlsZChjbG9uZSk7XG5cbiAgLyogZ2VuZXJhdGUgc29tZSBsaXBzdW0gKi9cbiAgdGhpcy5yZW5kZXIoKTtcbn07XG5cbmxvcmVtUHJvdG8uYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJlbmRlcigpO1xufTtcblxuZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCdsb3JlbS1pcHN1bScsIHsgcHJvdG90eXBlOiBsb3JlbVByb3RvIH0pO1xuIiwidmFyIGRpY3Rpb25hcnkgPSB7XG4gIHdvcmRzOiBbXG4gICAgJ2FkJyxcbiAgICAnYWRpcGlzaWNpbmcnLFxuICAgICdhbGlxdWEnLFxuICAgICdhbGlxdWlwJyxcbiAgICAnYW1ldCcsXG4gICAgJ2FuaW0nLFxuICAgICdhdXRlJyxcbiAgICAnY2lsbHVtJyxcbiAgICAnY29tbW9kbycsXG4gICAgJ2NvbnNlY3RldHVyJyxcbiAgICAnY29uc2VxdWF0JyxcbiAgICAnY3VscGEnLFxuICAgICdjdXBpZGF0YXQnLFxuICAgICdkZXNlcnVudCcsXG4gICAgJ2RvJyxcbiAgICAnZG9sb3InLFxuICAgICdkb2xvcmUnLFxuICAgICdkdWlzJyxcbiAgICAnZWEnLFxuICAgICdlaXVzbW9kJyxcbiAgICAnZWxpdCcsXG4gICAgJ2VuaW0nLFxuICAgICdlc3NlJyxcbiAgICAnZXN0JyxcbiAgICAnZXQnLFxuICAgICdldScsXG4gICAgJ2V4JyxcbiAgICAnZXhjZXB0ZXVyJyxcbiAgICAnZXhlcmNpdGF0aW9uJyxcbiAgICAnZnVnaWF0JyxcbiAgICAnaWQnLFxuICAgICdpbicsXG4gICAgJ2luY2lkaWR1bnQnLFxuICAgICdpcHN1bScsXG4gICAgJ2lydXJlJyxcbiAgICAnbGFib3JlJyxcbiAgICAnbGFib3JpcycsXG4gICAgJ2xhYm9ydW0nLFxuICAgICdMb3JlbScsXG4gICAgJ21hZ25hJyxcbiAgICAnbWluaW0nLFxuICAgICdtb2xsaXQnLFxuICAgICduaXNpJyxcbiAgICAnbm9uJyxcbiAgICAnbm9zdHJ1ZCcsXG4gICAgJ251bGxhJyxcbiAgICAnb2NjYWVjYXQnLFxuICAgICdvZmZpY2lhJyxcbiAgICAncGFyaWF0dXInLFxuICAgICdwcm9pZGVudCcsXG4gICAgJ3F1aScsXG4gICAgJ3F1aXMnLFxuICAgICdyZXByZWhlbmRlcml0JyxcbiAgICAnc2ludCcsXG4gICAgJ3NpdCcsXG4gICAgJ3N1bnQnLFxuICAgICd0ZW1wb3InLFxuICAgICd1bGxhbWNvJyxcbiAgICAndXQnLFxuICAgICd2ZWxpdCcsXG4gICAgJ3ZlbmlhbScsXG4gICAgJ3ZvbHVwdGF0ZScgIFxuICBdXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRpY3Rpb25hcnk7IiwidmFyIGdlbmVyYXRvciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgb3B0aW9ucyA9IChhcmd1bWVudHMubGVuZ3RoKSA/IGFyZ3VtZW50c1swXSA6IHt9XG4gICAgLCBjb3VudCA9IG9wdGlvbnMuY291bnQgfHwgMVxuICAgICwgdW5pdHMgPSBvcHRpb25zLnVuaXRzIHx8ICdzZW50ZW5jZXMnXG4gICAgLCBzZW50ZW5jZUxvd2VyQm91bmQgPSBvcHRpb25zLnNlbnRlbmNlTG93ZXJCb3VuZCB8fCA1XG4gICAgLCBzZW50ZW5jZVVwcGVyQm91bmQgPSBvcHRpb25zLnNlbnRlbmNlVXBwZXJCb3VuZCB8fCAxNVxuXHQgICwgcGFyYWdyYXBoTG93ZXJCb3VuZCA9IG9wdGlvbnMucGFyYWdyYXBoTG93ZXJCb3VuZCB8fCAzXG5cdCAgLCBwYXJhZ3JhcGhVcHBlckJvdW5kID0gb3B0aW9ucy5wYXJhZ3JhcGhVcHBlckJvdW5kIHx8IDdcblx0ICAsIGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0IHx8ICdwbGFpbidcbiAgICAsIHdvcmRzID0gb3B0aW9ucy53b3JkcyB8fCByZXF1aXJlKCcuL2RpY3Rpb25hcnknKS53b3Jkc1xuICAgICwgcmFuZG9tID0gb3B0aW9ucy5yYW5kb20gfHwgTWF0aC5yYW5kb207XG5cbiAgdW5pdHMgPSBzaW1wbGVQbHVyYWxpemUodW5pdHMudG9Mb3dlckNhc2UoKSk7XG5cbiAgdmFyIHJhbmRvbUludGVnZXIgPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKHJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcbiAgfTtcbiAgXG4gIHZhciByYW5kb21Xb3JkID0gZnVuY3Rpb24od29yZHMpIHtcbiAgICByZXR1cm4gd29yZHNbcmFuZG9tSW50ZWdlcigwLCB3b3Jkcy5sZW5ndGggLSAxKV07XG4gIH07XG4gIFxuICB2YXIgcmFuZG9tU2VudGVuY2UgPSBmdW5jdGlvbih3b3JkcywgbG93ZXJCb3VuZCwgdXBwZXJCb3VuZCkge1xuICAgIHZhciBzZW50ZW5jZSA9ICcnXG4gICAgICAsIGJvdW5kcyA9IHttaW46IDAsIG1heDogcmFuZG9tSW50ZWdlcihsb3dlckJvdW5kLCB1cHBlckJvdW5kKX07XG4gICAgXG4gICAgd2hpbGUgKGJvdW5kcy5taW4gPCBib3VuZHMubWF4KSB7XG4gICAgICBzZW50ZW5jZSA9IHNlbnRlbmNlICsgJyAnICsgcmFuZG9tV29yZCh3b3Jkcyk7XG4gICAgICBib3VuZHMubWluID0gYm91bmRzLm1pbiArIDE7XG4gICAgfVxuICAgIFxuICAgIGlmIChzZW50ZW5jZS5sZW5ndGgpIHtcbiAgICAgIHNlbnRlbmNlID0gc2VudGVuY2Uuc2xpY2UoMSk7XG4gICAgICBzZW50ZW5jZSA9IHNlbnRlbmNlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc2VudGVuY2Uuc2xpY2UoMSk7XG4gICAgfVxuICBcbiAgICByZXR1cm4gc2VudGVuY2U7XG4gIH07XG5cbiAgdmFyIHJhbmRvbVBhcmFncmFwaCA9IGZ1bmN0aW9uKHdvcmRzLCBsb3dlckJvdW5kLCB1cHBlckJvdW5kLCBzZW50ZW5jZUxvd2VyQm91bmQsIHNlbnRlbmNlVXBwZXJCb3VuZCkge1xuICAgIHZhciBwYXJhZ3JhcGggPSAnJ1xuICAgICAgLCBib3VuZHMgPSB7bWluOiAwLCBtYXg6IHJhbmRvbUludGVnZXIobG93ZXJCb3VuZCwgdXBwZXJCb3VuZCl9O1xuICAgICAgXG4gICAgd2hpbGUgKGJvdW5kcy5taW4gPCBib3VuZHMubWF4KSB7XG4gICAgICBwYXJhZ3JhcGggPSBwYXJhZ3JhcGggKyAnLiAnICsgcmFuZG9tU2VudGVuY2Uod29yZHMsIHNlbnRlbmNlTG93ZXJCb3VuZCwgc2VudGVuY2VVcHBlckJvdW5kKTtcbiAgICAgIGJvdW5kcy5taW4gPSBib3VuZHMubWluICsgMTtcbiAgICB9XG4gICAgXG4gICAgaWYgKHBhcmFncmFwaC5sZW5ndGgpIHtcbiAgICAgIHBhcmFncmFwaCA9IHBhcmFncmFwaC5zbGljZSgyKTtcbiAgICAgIHBhcmFncmFwaCA9IHBhcmFncmFwaCArICcuJztcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHBhcmFncmFwaDtcbiAgfVxuICBcbiAgdmFyIGl0ZXIgPSAwXG4gICAgLCBib3VuZHMgPSB7bWluOiAwLCBtYXg6IGNvdW50fVxuICAgICwgc3RyaW5nID0gJydcbiAgICAsIHByZWZpeCA9ICcnXG4gICAgLCBzdWZmaXggPSBcIlxcclxcblwiO1xuXG4gIGlmIChmb3JtYXQgPT0gJ2h0bWwnKSB7XG4gICAgcHJlZml4ID0gJzxwPic7XG4gICAgc3VmZml4ID0gJzwvcD4nO1xuICB9XG4gICAgICBcbiAgd2hpbGUgKGJvdW5kcy5taW4gPCBib3VuZHMubWF4KSB7XG4gICAgc3dpdGNoICh1bml0cy50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlICd3b3Jkcyc6XG4gICAgICAgIHN0cmluZyA9IHN0cmluZyArICcgJyArIHJhbmRvbVdvcmQod29yZHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NlbnRlbmNlcyc6XG4gICAgICAgIHN0cmluZyA9IHN0cmluZyArICcuICcgKyByYW5kb21TZW50ZW5jZSh3b3Jkcywgc2VudGVuY2VMb3dlckJvdW5kLCBzZW50ZW5jZVVwcGVyQm91bmQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3BhcmFncmFwaHMnOlxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcgKyBwcmVmaXggKyByYW5kb21QYXJhZ3JhcGgod29yZHMsIHBhcmFncmFwaExvd2VyQm91bmQsIHBhcmFncmFwaFVwcGVyQm91bmQsIHNlbnRlbmNlTG93ZXJCb3VuZCwgc2VudGVuY2VVcHBlckJvdW5kKSArIHN1ZmZpeDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGJvdW5kcy5taW4gPSBib3VuZHMubWluICsgMTtcbiAgfVxuICAgIFxuICBpZiAoc3RyaW5nLmxlbmd0aCkge1xuICAgIHZhciBwb3MgPSAwO1xuICAgIFxuICAgIGlmIChzdHJpbmcuaW5kZXhPZignLiAnKSA9PSAwKSB7XG4gICAgICBwb3MgPSAyO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nLmluZGV4T2YoJy4nKSA9PSAwIHx8IHN0cmluZy5pbmRleE9mKCcgJykgPT0gMCkge1xuICAgICAgcG9zID0gMTtcbiAgICB9XG4gICAgXG4gICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKHBvcyk7XG4gICAgXG4gICAgaWYgKHVuaXRzID09ICdzZW50ZW5jZXMnKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgKyAnLic7XG4gICAgfVxuICB9ICBcbiAgXG4gIHJldHVybiBzdHJpbmc7XG59O1xuXG5mdW5jdGlvbiBzaW1wbGVQbHVyYWxpemUoc3RyaW5nKSB7XG4gIGlmIChzdHJpbmcuaW5kZXhPZigncycsIHN0cmluZy5sZW5ndGggLSAxKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gc3RyaW5nICsgJ3MnO1xuICB9XG4gIHJldHVybiBzdHJpbmc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuZXJhdG9yO1xuIl19
