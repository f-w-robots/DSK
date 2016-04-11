import Ember from 'ember';

var Mover = Ember.Mixin.create({
  canMove: function() {
    return this.get('crashed') || this.get('winned');
  },

  moveAnimate: function() {
    if(this.canMove())
      return
    this.wait(false);
    var self = this;
    var count = 0;
    var intervalId = setInterval(function() {
      if(count >= 100) {
        clearInterval(intervalId);
        self.wait();
        return;
      }
      count += 1
      self.move();
      self.update();
    }, 10)
  },

  rotateAnimate: function(direction) {
    if(this.canMove())
      return;
    this.wait(false);
    var speed = 100;
    var self = this;
    var count = 0;
    var dAngle = (Math.PI/2)/speed;
    if(direction == 'l')
      dAngle = -dAngle
    var intervalId = setInterval(function() {
      if(count >= speed) {
        clearInterval(intervalId);
        self.wait();
        return;
      }
      count += 1;
      self.set('angle', self.get('angle') + dAngle);
      self.update();
    }, 10);
  },

  move: function() {
    if(this.canMove())
      return;
    var angle = this.get('angle');
    var dx = Math.round(Math.cos(angle));
    var dy = Math.round(Math.sin(angle));

    var xy = this.get('position');
    xy[0] += dx;
    xy[1] += dy;
    this.updateSensors();
    if(this.get('sensors')[0] == '2')
      this.win();
    else if(this.get('sensors')[0] != '0')
      this.crash();
  },

  realocate: function(command) {
    this.saveLastPosition();
    if(command == 'f')
      this.moveAnimate();
    if(command == 'l' || command == 'r')
      this.rotateAnimate(command);
  },

  saveLastPosition: function() {
    this.set('positionLast', this.get('position').slice(0));
    this.set('angleLast', this.get('angle'));
  },

  restore: function() {
    this.set('position', this.get('positionLast').slice(0));
    this.set('angle', this.get('angleLast'));
    this.set('crashed', false);
    this.readyToNewMsg();
    this.update();
  }

});

var Painter = Ember.Mixin.create({
  makeImage: function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var context = ctx;

    canvas.width = this.get('size') - 20;
    canvas.height = this.get('size');

    if(this.get('crashed'))
      ctx.fillStyle = '#973622';
    else if(this.get('winned'))
      ctx.fillStyle = '#90C3D4';
    else
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

});

export default Ember.Component.extend(Painter, Mover, {
  deviceId: null,
  position: null,
  ready: false,
  size: 64,
  position: null,
  angle: null,
  status: 'power',
  waitProp: true,
  crashed: false,

  didInsertElement: function() {
    this.get('parentView').send('registerDevice', this);
    this.connect();
  },

  updateStatus: function(status) {
    this.set('status', status);
    this.update();
  },

  update() {
    this.get('parentView').send('update', this);
  },

  getId: function() {
    return this.get('deviceId');
  },

  connect: function() {
    var self = this;

    setTimeout(function() {
      var socket = new WebSocket("ws://" + location.hostname + ":2500/turtle" + self.getId());
      self.set('socket', socket);

      socket.onopen = function (event) {
        self.updateStatus('ok');
      };

      socket.onmessage = function (event) {
        if(event.data.startsWith("restore")) {
          self.restore();
        } else {
          self.execCommand(event.data[0]);
          self.get('socket').send('accepted');
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

  isReady: function() {
    return this.get('ready');
  },

  prepare: function(position, angle) {
    this.set('position', position);
    this.set('angle', angle);
    this.set('ready', true);
  },

  readyToNewMsg: function() {
    this.get('socket').send('ready');
  },

  execCommand: function(commands) {
    var i = 0;
    var self = this;
    var intervalId = setInterval(function() {
      if(!self.get('waitProp'))
        return;
      if(self.get('crashed') || self.get('winned')) {
        clearInterval(intervalId);
        return;
      }
      if(i > commands.length - 1) {
        clearInterval(intervalId);
        self.readyToNewMsg();
        return;
      }
      var command = commands[i];
      i++;

      self.realocate(command);
    }, 10);
  },


  wait: function(wait = true) {
    this.set('waitProp', wait);
  },

  crash: function() {
    this.set('crashed', true);
    this.get('socket').send('crash');
  },

  win: function() {
    this.set('winned', true);
    this.get('socket').send('win');
  },

  updateSensors: function() {
    var xy = this.get('position');
    var angle = this.get('angle');
    var size = Math.trunc(this.get('size') / 2 + 1);
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
        if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 611) {
          sensors = sensors + '2';
        } else {
          sensors = sensors + '1';
        }
      }
    }
    this.set('sensors', sensors)
  },
});
