import Ember from 'ember';

export default Ember.Component.extend({
  position: null,
  ready: false,
  size: 64,
  position: null,
  carId: null,
  angle: null,
  status: 'power',

  didInsertElement: function() {
    this.get('parentView').send('registerDevice', this);
    this.setReady();
  },

  updateStatus: function(status) {
    this.set('status', status);
    this.update();
  },

  update() {
    this.get('parentView').send('update', this);
  },

  getId: function() {
    return this.get('carId');
  },

  setReady: function() {
    this.set('ready', true);
    var self = this;

    setTimeout(function() {
      var socket = new WebSocket("ws://localhost:2500/turtle" + self.getId());
      self.set('socket', socket);
      socket.onopen = function (event) {
        self.updateStatus('ok');
        socket.send('wait');
      };

      socket.onmessage = function (event) {
        if(event.data.startsWith("S")) {
          self.execCommand(event.data.substr(1,event.data.length));
        }
      };

      socket.onerror = function (event) {
        self.updateStatus('error');
      };

      socket.onclose = function (event) {
        self.updateStatus('error');
      };

    }, Math.random() * 300);

  },

  getPosition() {
    return [this.get('position'), this.get('angle')];
  },

  setPosition(position, angle) {
    this.set('position', position);
    this.set('angle', angle);
  },

  makeImage: function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var context = ctx;

    canvas.width = this.get('size') - 20;
    canvas.height = this.get('size');

    ctx.fillStyle = '#DAB218';
    ctx.fillRect(0,0, canvas.width, canvas.height)

    ctx.beginPath();
    var status = this.get('status');
    if(status == 'power') {
      ctx.fillStyle = 'green';
    }
    if(status == 'error') {
      ctx.fillStyle = 'red';
    }
    if(status == 'ok') {
      ctx.fillStyle = 'blue';
    }
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = '#0AB218';
    ctx.fillRect(0,0, canvas.width, 10)

    return canvas;
  },

  draw: function(field) {
    var context = field.getContext("2d");
    var xy = this.get('position');

    var image = this.makeImage()

    context.save();
	  context.translate(xy[0], xy[1]);
	  context.rotate(this.get('angle') + Math.PI/2);
	  context.drawImage(image, -(image.width/2), -(image.height/2));
    context.restore();
  },

  execCommand: function(command) {
    console.log(command);
    if(command == 'f')
      this.moveAnimate()
    if(command == 'l' || command == 'r')
      this.rotateAnimate(command);
  },

  moveAnimate: function() {
    var self = this;
    var count = 0;
    var intervalId = setInterval(function() {
      if(count >= 100) {
        clearInterval(intervalId);
        return;
      }
      count += 1
      self.move();
      self.update();
    }, 10)
  },

  rotateAnimate: function(direction) {
    var speed = 100;
    var self = this;
    var count = 0;
    var dAngle = (Math.PI/2)/speed;
    if(direction == 'l')
      dAngle = -dAngle
    var intervalId = setInterval(function() {
      if(count >= speed) {
        clearInterval(intervalId);
        return;
      }
      count += 1;
      self.set('angle', self.get('angle') + dAngle);
      self.update();
    }, 10);
  },

  move: function() {
    var angle = this.get('angle');
    var dx = Math.round(Math.cos(angle));
    var dy = Math.round(Math.sin(angle));

    var xy = this.get('position');
    xy[0] += dx;
    xy[1] += dy;
  },

  updateSensors: function() {
    var position = this.getPosition();
    var xy = position[0];
    var angle = position[1];
    var size = Math.trunc(this.get('imgSize') / 2 + 1);
    var ctx = field.getContext("2d");

    var sensors = '';

    var dx = Math.round(Math.cos(angle));
    var dy = Math.round(Math.sin(angle));

    for (var i = 0; i < 4; i++) {
      var a = [xy[0] + size * dx + size * dy - 1 * dx, xy[1] + size * dy + size * dx - 1 * dy]
      if(i == 0)
        var a = [xy[0] + size * dx, xy[1] + size * dy]
      if(i == 2) {
        sensors = sensors + '-';
        continue;
      }
      var sensor = ctx.getImageData(a[0], a[1], 1, 1);
      if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 765) {
        sensors = sensors + '0';
      } else {
        sensors = sensors + '1';
      }
    }
    this.set('sensors', sensors)
  },

});
