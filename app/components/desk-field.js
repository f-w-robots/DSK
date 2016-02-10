import Ember from 'ember';

export default Ember.Component.extend(Ember.Evented, {
  cars: {},
  obstacles: null,

  generateObstacles: function() {
    var cellCount = this.get('cellCount');

    this.set('obstacles', []);
    for(var i = 0; i < cellCount; i++) {
      var positionX = Math.trunc(Math.random() * (cellCount - 0.00001));
      var positionY = Math.trunc(Math.random() * (cellCount - 0.00001));
      this.get('obstacles').push([positionX, positionY]);
    }
  },

  generateField: function() {
    var ctx = field.getContext('2d');
    var border = this.get('border');
    var cellSize = this.get('cellSize');
    var cellCount = this.get('cellCount');
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

    if(!this.get('obstacles')) {
      this.generateObstacles();
    }
    for(var i = 0; i < this.get('obstacles').length; i++) {

      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.lineWidth = 1;

      var positionX = this.get('obstacles')[i][0];
      var positionY = this.get('obstacles')[i][1];

      ctx.arc(offset + cellSize * positionX, offset + cellSize * positionY, cellSize * 0.4, 0, 2 * Math.PI, false);
      ctx.fill();

      ctx.stroke();
    }
  },

  displayCars: function() {
    var ctx = field.getContext("2d");
    for (var key in this.get('cars')) {
      var img = this.get('cars')[key].getImage()
      ctx.drawImage(img,100,100, 100, 100);
    }
  },

  generate: function() {
    this.generateField();
    this.displayCars();
  },

  didInsertElement: function() {
    this.generate();
  },

  actions: {
    update: function() {
      this.generate();
    },

    registerCar: function(car) {
      this.get('cars')[car.getId()] = car;
    }
  }
});
