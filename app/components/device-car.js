import Ember from 'ember';

export default Ember.Component.extend({
  position: null,
  ready: false,

  didInsertElement: function() {
    this.get('parentView').send('registerCar', this);
  },

  getId: function() {
    return this.get('position');
  },

  setReady: function() {
    ready: true,
    // connect to socket
  }
});
