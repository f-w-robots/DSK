import Ember from 'ember';

export default Ember.Component.extend({
  position: null,
  ready: false,
  img: null,
  imgSize: 64,
  position: null,
  carId: null,
  angle: null,
  status: 'power',

  didInsertElement: function() {
    this.get('parentView').send('registerCar', this);

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
      // TODO - ip
      var socket = new WebSocket("ws://localhost:2500/turtle" + self.getId());
      self.set('socket', socket);
      socket.onopen = function (event) {
        self.updateStatus('ok');
        socket.send('wait');
      };

      socket.onmessage = function (event) {
        console.log(event.data);
        self.command(event.data);
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


    }, Math.random() * 100);

  },

  getPosition() {
    return [this.get('position'), this.get('angle')];
  },

  setPosition(position, angle) {
    this.set('position', position);
    this.set('angle', angle);
  },

  draw: function(field) {
    var ctx = field.getContext("2d");
    ctx.fillStyle = '#DAB218';
    var position = this.getPosition();
    var xy = position[0];
    var angle = this.get('angle');
    var size = this.get('imgSize');
    var siz = this.get('imgSize') / 2;
    var deltaSize = 10;

    var dy = Math.abs(Math.round(Math.cos(angle)));
    var dx = Math.abs(Math.round(Math.sin(angle)));

    ctx.fillRect(xy[0] - size / 2 + dx * deltaSize, xy[1] - size / 2 + dy * deltaSize,
       size - dx * deltaSize * 2, size - dy * deltaSize * 2);

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
    ctx.arc(xy[0], xy[1], size * 0.2, 0, 2 * Math.PI, false);
    ctx.fill();
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
      self.moveForward();
      self.update();
    }, 10)
  },

  rotateAnimate: function(direction) {
    // var self = this;
    // var count = 0;
    // var dAngle = Math.PI/30;
    // var intervalId = setInterval(function() {
    //   console.log('int');
    //   if(count >= 30) {
    //     clearInterval(intervalId);
    //     return;
    //   }
    //   count += 1;
    //   self.set('angle', self.get('angle') + dAngle);
    //   self.update();
    // }, 500)
    this.rotate(direction);
    this.update();
  },

  rotate: function(direction) {
    var xy = this.get('position');
    if(direction == 'r')
      this.set('angle', this.get('angle') + Math.PI / 2);
    if(direction == 'l')
      this.set('angle', this.get('angle') - Math.PI / 2);
  },


  // by algorithm
  command: function(command) {
    if(command == 'f')
      this.moveForward();
    if(command == 'r' || command == 'l') {
      this.get('socket').close();
      this.rotateMove('l');
      this.rotateMove(command);
    }
    if(command == 's')
      this.get('socket').close();
    if(command == 'b') {
      this.rotateMove('l');
      this.rotateMove('l');
    }
    this.update();
  },

  rotateMove: function(direction) {
    var xy = this.get('position');
    this.moveForward(28)
    if(direction == 'r')
      this.set('angle', this.get('angle') + Math.PI / 2)
    if(direction == 'l')
      this.set('angle', this.get('angle') - Math.PI / 2)
  },

  moveForward: function(step = 1) {
    var angle = this.get('angle');
    var dx = Math.round(Math.cos(angle));
    var dy = Math.round(Math.sin(angle));

    var xy = this.get('position');
    xy[0] += dx * step;
    xy[1] += dy * step;
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
    var a = [xy[0] + size * dx, xy[1] + size * dy]
    var sensor = ctx.getImageData(a[0], a[1], 1, 1);
    if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 765) {
      sensors = sensors + '0';
    } else {
      sensors = sensors + '1';
    }

    var a = [xy[0] + size * dx + size * dy - 1 * dx, xy[1] + size * dy + size * dx - 1 * dy]
    var sensor = ctx.getImageData(a[0], a[1], 1, 1);
    if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 765) {
      sensors = sensors + '0';
    } else {
      sensors = sensors + '1';
    }

    sensors = sensors + '-';

    var a = [xy[0] + size * dx - size * dy - 1 * dx, xy[1] + size * dy - size * dx - 1 * dy]
    var sensor = ctx.getImageData(a[0], a[1], 1, 1);
    if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 765) {
      sensors = sensors + '0';
    } else {
      sensors = sensors + '1';
    }
    console.log(sensors);
    this.set('sensors', sensors)
  },

  setReadyA: function() {
    this.set('ready', true);
    var self = this;


    setTimeout(function() {
      // TODO - ip
      var socket = new WebSocket("ws://localhost:2500/turtle");
      self.set('socket', socket);
      socket.onopen = function (event) {
        self.updateStatus('ok');
        self.updateSensors();
        socket.send(self.get('sensors'));
      };

      socket.onmessage = function (event) {
        self.command(event.data);
        if(event.data.startsWith("S")) {
          event.data('')
        }
          self.updateSensors();
        socket.send(self.get('sensors'));
        console.log(event.data);

      };

      socket.onerror = function (event) {
        self.updateStatus('error');
      };

      socket.onclose = function (event) {
        self.updateStatus('error');
      };


    }, Math.random() * 3000);

  },


});
