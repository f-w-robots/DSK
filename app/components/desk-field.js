import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement: function() {
		var ctx = field.getContext('2d');
    var border = 10;
    var cellSize = 100;
    var cellCount = 8;
    field.width  = cellCount * cellSize + 2 * border;
    field.height = field.width;
    ctx.fillRect(0, 0, field.width, field.height);
    ctx.lineWidth = border * 2;
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(0, 0, field.width, field.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = cellSize / 10;

    for (var i = 0; i < cellCount; i++) {
      var offset = border + cellSize / 2;

      ctx.beginPath();
      ctx.moveTo(offset - border/2, offset + cellSize * i);
      ctx.lineTo(field.width - offset + border / 2, offset + cellSize * i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offset + cellSize * i, offset);
      ctx.lineTo(offset + cellSize * i, field.width - offset);
      ctx.stroke();
    }
  }
});
