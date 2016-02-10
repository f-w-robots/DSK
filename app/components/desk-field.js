import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement: function() {
		var ctx    = canvas.getContext('2d');
    canvas.width  = 640;
    canvas.height = 480;
    ctx.strokeRect(15, 15, 266, 266);
    ctx.strokeRect(18, 18, 260, 260);
    ctx.fillRect(20, 20, 256, 256);
    for (var i = 0; i < 8; i += 2)
      for (var j = 0; j < 8; j += 2) {
        ctx.clearRect(20 + i * 32, 20 + j * 32, 32, 32);
        ctx.clearRect(20 + (i + 1) * 32, 20 + (j + 1) * 32, 32, 32);
      }
  }
});
