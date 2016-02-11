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

  updateImage: function(status) {
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
      var socket = new WebSocket("ws://localhost:2500/turtle");
      self.set('socket', socket);
      socket.onopen = function (event) {
        self.updateImage('ok');
        self.updateSensors();
        socket.send(self.get('sensors'));
      };

      socket.onmessage = function (event) {
        console.log(event.data);
        self.command(event.data);
        self.updateSensors();
        socket.send(self.get('sensors'));
      };

      socket.onerror = function (event) {
        self.updateImage('error');
      };

      socket.onclose = function (event) {
        self.updateImage('error');
      };


    }, Math.random() * 3000);

  },

  getPosition() {
    return [this.get('position'), this.get('angle')];
  },

  setPosition(position, angle) {
    this.set('position', position);
    this.set('angle', angle);
  },

  getImage() {
    return this.get('img')
  },

  command: function(command) {
    if(command == 'f')
      this.move();
    if(command == 'r' || command == 'l')
      this.rotate(command);
    if(command == 's')
      this.get('socket').close();
    if(command == 'r') {
      this.rotate('l');
      this.rotate(';');
    }
    this.update();
  },

  rotate: function(direction) {
    if(direction == 'r')
      this.set('angle', this.get('angle') + Math.PI / 2)
    if(direction == 'l')
      this.set('angle', this.get('angle') - Math.PI / 2)

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
    // for (var i = 0; i < 4; i++) {
    //   if(i == 2) {
    //     sensors = sensors + '-';
    //     continue;
    //   } else {
    //     // var dx = Math.round(size * Math.cos(angle));
    //     // var dy = Math.round(size * Math.sin(angle));
    //     var dx = Math.cos(angle);
    //     var dy = Math.sin(angle);
    //   }
    //   var sensor = ctx.getImageData(xy[0] + size * dx, xy[1] + size * dy, 1, 1);
    //
    //   if(i == 3) {
    //     console.log([xy[0] + size * dx, xy[1] + size * dy],
    //       [xy[0] + size * dx + Math.round(size/2+1), xy[1] + size * dy]);
    //     sensor = ctx.getImageData(xy[0] + size * dx - 5, xy[1] - size , 1, 1);
    //   }
    //
    //   if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 255+255+255) {
    //     sensors = sensors + '1';
    //   } else {
    //     sensors = sensors + '0';
    //   }
    // }
    var dx = Math.round(Math.cos(angle));
    var dy = Math.round(Math.sin(angle));
    var a = [xy[0] + size * dx, xy[1] + size * dy]
    var sensor = ctx.getImageData(a[0], a[1], 1, 1);
    console.log(a, sensor.data[0] + sensor.data[1] + sensor.data[2]);
    if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 765) {
      sensors = sensors + '0';
    } else {
      sensors = sensors + '1';
    }

    var a = [xy[0] + size * dx + size * dy - 1 * dx, xy[1] + size * dy + size * dx - 1 * dy]
    var sensor = ctx.getImageData(a[0], a[1], 1, 1);
    console.log(a, sensor.data[0] + sensor.data[1] + sensor.data[2]);
    if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 765) {
      sensors = sensors + '0';
    } else {
      sensors = sensors + '1';
    }

    sensors = sensors + '-';

    var a = [xy[0] + size * dx - size * dy - 1 * dx, xy[1] + size * dy - size * dx - 1 * dy]
    var sensor = ctx.getImageData(a[0], a[1], 1, 1);
    console.log(a, sensor.data[0] + sensor.data[1] + sensor.data[2]);
    if(sensor.data[0] + sensor.data[1] + sensor.data[2] == 765) {
      sensors = sensors + '0';
    } else {
      sensors = sensors + '1';
    }

    // sensors = sensors + '1';
    console.log(sensors);
    this.set('sensors', sensors)
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

});
