import Ember from 'ember';

export default Ember.Component.extend({
  position: null,
  ready: false,
  img: null,

  didInsertElement: function() {
    var img = new Image();
    this.set('img', img)

    self = this;
    img.onload = function () {
      self.get('parentView').send('registerCar', self);
      self.get('parentView').send('update', self);
    }

    img.src = "images/robot.png";
  },

  getId: function() {
    return this.get('position');
  },

  setReady: function() {
    this.set('ready', true);
  },

  getPosition() {
    return [1,1];
  },

  getImage() {
    return this.get('img')
  }
});
