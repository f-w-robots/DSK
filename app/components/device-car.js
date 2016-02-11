import Ember from 'ember';

export default Ember.Component.extend({
  position: null,
  ready: false,
  img: null,
  imgSize: 65,
  position: null,
  carId: null,

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
    // TODO - ip
    var socket = new WebSocket("ws://localhost:2500/turtle");
    var self = this;
    socket.onopen = function (event) {
      self.updateImage('ok');
    };

  },

  getPosition() {
    return this.get('position');
  },

  setPosition(position) {
    this.set('position', position);
  },

  getImage() {
    return this.get('img')
  }
});
