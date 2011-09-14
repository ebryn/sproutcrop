// ==========================================================================
// Project:   sproutcrop
// Copyright: ©2011 My Company Inc. All rights reserved.
// ==========================================================================

require('sproutcore');
require('sproutcore-touch');

App = SC.Application.create();

App.controller = SC.Object.create({
  canvas: null,

  crop: function() {
    this.get('canvas').getCroppedImage();
    $('#screen').hide();
    $('#output').show();
  },
  reset: function() {
    this.get('canvas').rerender();
    $('#output').hide();
    $('#screen').show();
  }
});

App.CanvasImage = SC.View.extend({
  tagName: 'canvas',

  canvasWidth: 320,
  canvasHeight: 407,

  image: null,
  scale: 1.0,
  x: null,
  y: null,
  width: null,
  height: null,

  init: function() {
    this._super();
    App.controller.set("canvas", this);
  },

  didInsertElement: function() {
    var self = this, canvas = this.$()[0], ctx = canvas.getContext('2d'), img = new Image();
    img.onload = function() {
      self.set('image', img);
      canvas.width = self.get('canvasWidth');
      canvas.height = self.get('canvasHeight');
      self.set('width', img.width);
      self.set('height', img.height);
      self.drawImage();
    };
    alert(decodeURIComponent(location.search.replace('?img=', '')));
    img.src = decodeURIComponent(location.search.replace('?img=', ''));
  },

  drawImage: function() {
    var ctx = this.$()[0].getContext('2d'), img = this.get('image'),
        x = this.get('x'), y = this.get('y'),
        canvasWidth = this.get('canvasWidth'), canvasHeight = this.get('canvasHeight');

    if (!x && !y) {
      x = -(img.width / 2) + canvasWidth / 2;
      y = -(img.height / 2) + canvasHeight / 2;
      this.setProperties({x: x, y: y});
    }

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, img.width, img.height, x, y, this.get('width'), this.get('height'));
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvasWidth, 112);
    ctx.fillRect(0, 294, canvasWidth, 112);
  },

  getCroppedImage: function() {
    var canvas = this.$()[0], canvasWidth = this.get('canvasWidth');

    var cropCanvas = document.createElement('canvas');
    cropCanvas.width = canvasWidth;
    cropCanvas.height = 182;
    cropCanvas.getContext('2d').drawImage(canvas, 0, 112, canvasWidth, 182, 0, 0, canvasWidth, 182);
    document.getElementById('croppedImage').src = cropCanvas.toDataURL();
    window.localStorage.setItem("croppedImage", cropCanvas.toDataURL());
  },

  panChange: function(rec) {
    var val = rec.get('translation');
    this.set('x', this.get('x') + val.x);
    this.set('y', this.get('y') + val.y);

    this.drawImage();
  },

  pinchChange: function(rec) {
    var canvas = this.$()[0], ctx = canvas.getContext('2d'), img = this.get('image'),
        scale = this.get('scale') * rec.get('scale'),
        width = this.get('width'), height = this.get('height'),
        center = rec.centerPointForTouches(SC.get(rec.touches,'touches')),
        x = this.get('x'), y = this.get('y');

    //console.log("x: " + this.get('x') + ", y: " + this.get('y'));
    //console.log("center: x: " + center.x + ", y: " + center.y);
    var wDelta = (width * scale) - width, hDelta = (height * scale) - height;

    this.set('width', width * scale);
    this.set('height', height * scale);
    this.set('x', x - (wDelta / 2));
    this.set('y', y - (hDelta / 2));
    this.drawImage();
  }
});
