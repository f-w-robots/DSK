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

    self = this;
    img.onload = function () {

      self.get('parentView').send('update', self);
    }

    img.src = "images/car.png";
  },

  getId: function() {
    return this.get('carId');
  },

  setReady: function() {
    this.set('ready', true);
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
