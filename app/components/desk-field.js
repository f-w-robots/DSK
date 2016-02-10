import Ember from 'ember';

export default Ember.Component.extend(Ember.Evented, {
  cars: {},

  generate: function(field) {
    var ctx = field.getContext('2d');
    var border = this.get('border');
    var cellSize = this.get('cellSize');;
    var cellCount = this.get('cellCount');;
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
      ctx.moveTo(offset - border / 2, offset + cellSize * i);
      ctx.lineTo(field.width - offset + border / 2, offset + cellSize * i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offset + cellSize * i, offset);
      ctx.lineTo(offset + cellSize * i, field.width - offset);
      ctx.stroke();
    }

    for(var i = 0; i < cellCount * 2; i++) {
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.lineWidth = 1;

      var positionX = Math.trunc(Math.random() * (cellCount - 0.00001));
      var positionY = Math.trunc(Math.random() * (cellCount - 0.00001));

      ctx.arc(offset + cellSize * positionX, offset + cellSize * positionY, cellSize * 0.4, 0, 2 * Math.PI, false);
      ctx.fill();

      ctx.stroke();
    }
  },

  didInsertElement: function() {
    this.generate(field);

    $.field = this;
  },

  actions: {
    update: function() {
      alert("received");
    },

    registerCar: function(car) {
      car[car.getId()] = car;
    }
  }
});
