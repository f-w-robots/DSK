import Ember from 'ember';

export default Ember.Component.extend({
  position: null,
  ready: false,
  img: null,
  imgSize: 65,
  position: null,
  carId: null,
  angle: null,

  didInsertElement: function() {
    var img = new Image();
    this.set('img', img)

    this.get('parentView').send('registerCar', this);

    var self = this;
    img.onload = function () {
      self.get('parentView').send('update', self);
    }
    this.updateImage('power');
    this.setReady();
  },

  updateImage: function(url) {
    this.get('img').src = 'images/car_' + url + '.png';
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
      socket.onopen = function (event) {
        self.updateImage('ok');
        self.updateSensors();
      };

      socket.onmessage = function (event) {
        console.log(event.data);
        self.updateSensors();
        // socket.send(self.sensorsRead());
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

  updateSensors: function() {
    this.get('parentView').send('updateSensors', this);
  }
});
