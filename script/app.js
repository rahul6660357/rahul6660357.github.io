var Util = /** @class */ (function () {
  function Util() {
  }
  Util.isObject = function (item) {
      return item && typeof item === 'object' && !Array.isArray(item);
  };
  Util.mergeDeep = function (target, source) {
      var _this = this;
      var output = Object.assign({}, target);
      if (this.isObject(target) && this.isObject(source)) {
          Object.keys(source).forEach(function (key) {
              if (_this.isObject(source[key])) {
                  if (!(key in target))
                      Object.assign(output, (_a = {}, _a[key] = source[key], _a));
                  else
                      output[key] = _this.mergeDeep(target[key], source[key]);
              }
              else {
                  Object.assign(output, (_b = {}, _b[key] = source[key], _b));
              }
              var _a, _b;
          });
      }
      return output;
  };
  Util.map = function (n, start1, stop1, start2, stop2) {
      return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  };
  Util.debounce = function (func, wait, immediate) {
      var timeout;
      return function () {
          var context = this;
          var args = arguments;
          var later = function () {
              timeout = null;
              if (!immediate)
                  func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow)
              func.apply(context, args);
      };
  };
  Util.getMousePosition = function (e) {
      var posX = 0;
      var posY = 0;
      if (!e)
          e = window.event;
      if (e.pageX || e.pageY) {
          posX = e.pageX;
          posY = e.pageY;
      }
      else if (e.clientX || e.clientY) {
          posX = e.clientX - this.docScrolls().x;
          posY = e.clientY - this.docScrolls().y;
      }
      return {
          x: posX,
          y: posY
      };
  };
  Util.docScrolls = function () {
      return {
          x: document.body.scrollLeft + document.documentElement.scrollLeft,
          y: document.body.scrollTop + document.documentElement.scrollTop
      };
  };
  return Util;
}());
var Wave = /** @class */ (function () {
  function Wave(config) {
      this.phase = 0;
      this.run = false;
      this.ratio = window.devicePixelRatio || 1;
      this.circleProgress = 0;
      this.GATF_cache = {};
      this.waves = config.waves;
      this.container = config.container;
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.width_2 = this.width / 2;
      this.height_2 = this.height / 2;
      this.MAX = this.height_2 - 4;
      this.speed = config.speed || 0.02;
      this.onLoaded = config.onLoaded;
      this.speedChange = config.speedChange || false;
      this.setup();
  }
  Wave.prototype.setup = function () {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this._getRadius();
      this._creatGradient();
      this._attachEvents();
  };
  Wave.prototype._creatGradient = function () {
      this.gradient = this.ctx.createLinearGradient(0, 0, 0, 2 * this.radius);
      this.gradient.addColorStop(0, 'rgb(255,255,255)');
      this.gradient.addColorStop(1, 'rgb(255,255,255)');
  };
  Wave.prototype._getRadius = function () {
      this.radius = 0.33 * this.height;
      this.squareSide = Math.sqrt(Math.pow(2 * this.radius, 2) / 2);
  };
  Wave.prototype._drawBase = function () {
      this.ctx.strokeStyle = this.gradient;
      this.ctx.beginPath();
      this.ctx.arc(this.width_2, this.height_2, this.radius, 0, (Math.PI / 180) * this.circleProgress);
      this.ctx.stroke();
  };
  Wave.prototype._updateBase = function () {
      this.circleProgress += 5;
      if (this.circleProgress >= 360) {
          this.onLoaded && this.onLoaded();
      }
  };
  Wave.prototype._globAttFunc = function (x) {
      if (this.GATF_cache[x] == null) {
          this.GATF_cache[x] = Math.pow(4 / (4 + Math.pow(x, 4)), 4);
      }
      return this.GATF_cache[x];
  };
  Wave.prototype._color = function (opacity) {
      opacity = opacity || 1;
      var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
      return (gradient.addColorStop(0, "rgba(171,123,65," + opacity + ")"),
          gradient.addColorStop(1, "rgba(62,47,91," + opacity + ")"),
          gradient);
  };
  Wave.prototype._xPos = function (t) {
      return this.width_2 + this.radius * Math.sin(t);
  };
  Wave.prototype._yPos = function (i, attenuation, frequency, amplitude) {
      var att = (this.MAX * amplitude) / attenuation;
      return (this.height_2 +
          this.radius * Math.cos(i) +
          (this._globAttFunc(i) + att * Math.sin(frequency * i + this.phase)));
  };
  Wave.prototype._drawLine = function (attenuation, color, frequency, amplitude, thickness) {
      this.ctx.moveTo(0, 0);
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = thickness / this.ratio;
      for (var s = 0.09; (s += 0.01) <= Math.PI * 2;) {
          var a = this._yPos(s, attenuation, frequency, amplitude);
          var r = this._xPos(s);
          this.ctx.lineTo(r, a);
      }
      this.ctx.closePath();
      this.ctx.stroke();
  };
  Wave.prototype._clear = function () {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.globalCompositeOperation = 'source-over';
  };
  Wave.prototype._draw = function () {
      if (this.run === false)
          return;
      this.phase = (this.phase + Math.PI * this.speed) % (2 * Math.PI);
      this._clear();
      if (this.circleProgress < 360) {
          this._updateBase();
          this._drawBase();
      }
      else {
          for (var i = 0, len = this.waves.length; i < len; i++) {
              var wave = this.waves[i];
              if (wave.startAmplitude < wave.amplitude) {
                  wave.startAmplitude += 0.001;
              }
              this._drawLine(wave.attenuation, this._color(wave.opacity), wave.frequency, wave.startAmplitude, wave.thickness);
          }
      }
      requestAnimationFrame(this._draw.bind(this));
  };
  Wave.prototype._attachEvents = function () {
      window.addEventListener('resize', this._onResize.bind(this));
      window.addEventListener('mousemove', this._onHover.bind(this));
  };
  Wave.prototype._onHover = function (e) {
      if (this.speedChange) {
          this.speed = Util.map(e.clientX, 0, innerWidth, 0.02, -0.02);
      }
  };
  Wave.prototype._onResize = function () {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.width_2 = this.width / 2;
      this.height_2 = this.height / 2;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this._getRadius();
  };
  Wave.prototype.start = function () {
      this.run = true;
      this._draw();
  };
  Wave.prototype.stop = function () {
      this.run = false;
  };
  return Wave;
}());
var bg = document.querySelector('.bg');
var onLoaded = function () {
  bg.classList.add('show');
};
var intro = new Wave({
  container: document.querySelector('#intro'),
  onLoaded: onLoaded,
  speedChange: true,
  waves: [
      {
          frequency: 5,
          startAmplitude: 0,
          amplitude: 0.04,
          opacity: 0.4,
          attenuation: -2
      },
      {
          frequency: 3,
          startAmplitude: 0,
          amplitude: 0.04,
          opacity: 1,
          attenuation: -6
      },
      {
          frequency: 4,
          startAmplitude: 0,
          amplitude: 0.04,
          opacity: 0.3,
          attenuation: 0.4
      },
      {
          frequency: 4,
          startAmplitude: 0,
          amplitude: 0.04,
          opacity: 0.2,
          attenuation: 2
      },
      {
          frequency: 4,
          startAmplitude: 0,
          amplitude: 0.04,
          opacity: 1,
          attenuation: 0.8
      }
  ]
});
intro.start();


var crossbtn = document.getElementById("crossbtn");
var bar = document.getElementById("bar");

bar.addEventListener("click",()=>{
    crossbtn.click();
})