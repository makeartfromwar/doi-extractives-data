(function(exports) {

  var renderId = '__render_id';
  var EPSILON = .5;

  exports.EITIBar = document.registerElement('eiti-bar', {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {value: function() {
          this.__bar = getBar(this);
        }},

        attachedCallback: {value: function() {
          var self = this;
          // apply all attributes on the next frame
          requestAnimationFrame(function() {
            [].forEach.call(self.attributes, function(attr) {
              this['__' + attr.name] = attr.value;
            }, self);
            self.render();
          });
        }},

        min: numericProperty('min', 0),
        max: numericProperty('max', 1),
        value: numericProperty('value', 0),

        render: {value: render}
      }
    )
  });

  function getBar(parent) {
    var klass = 'eiti-bar-bar';
    var bar = parent.getElementsByClassName(klass)[0];
    if (!bar) {
      bar = parent.appendChild(document.createElement('span'));
      bar.setAttribute('class', klass);
    }
    return bar;
  }

  function render() {
    if (!this[renderId]) {
      this[renderId] = eiti.enqueue(_render.bind(this));
    }
  }

  function _render() {
    var min = this.min;
    var max = this.max;
    var value = this.value;

    var bar = getBar(this);
    bar.classList.toggle('eiti-bar-bar_negative', value < 0);

    var x = scale(value, min, max) * 100;
    var zero = min < 0 ? scale(0, min, max) * 100 : 0;
    var width = Math.abs(x - zero);
    if (width > 0) {
      bar.style.setProperty('width', (width < EPSILON
                            ? EPSILON
                            : width) + '%');
    } else {
      bar.style.setProperty('width', '0%');
    }

    if (min < 0) {
      if (value < 0) {
        bar.style.setProperty('left', (zero - width) + '%');
      } else {
        bar.style.setProperty('left', zero + '%');
      }
    } else {
      bar.style.removeProperty('left');
    }

    delete this[renderId];
  }

  function scale(value, min, max) {
    return (value - min) / (max - min);
  }

  function genericProperty(name, value, parse, change) {
    var symbol = '__' + name;
    return {
      get: function() {
        return (symbol in this) ? this[symbol] : value;
      },
      set: function(value) {
        if (parse) {
          value = parse.call(this, value, name);
        }
        if (value !== this[symbol]) {
          this[symbol] = value;
          if (change) {
            change.call(this, value, name);
          }
        }
      }
    };
  }

  function numericProperty(name, value, parse, change) {
    return genericProperty(name, value, parseNumber, change || render);
  }

  function parseNumber(n) {
    return isNaN(n) ? 0 : Number(n);
  }

  function parseBoolean(value) {
    return (typeof value === 'string')
      ? value === 'true'
      : !!value;
  }

})(this);
