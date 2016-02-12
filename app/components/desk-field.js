import Ember from 'ember';

export default Ember.Component.extend(Ember.Evented, {
  devices: {},
  obstacles: null,
  offset: null,

  generateObstacles: function() {
    var cellCount = this.get('cellCount');

    this.set('obstacles', []);

    for(var i = 0; i < cellCount;) {
      var positionX = Math.trunc(Math.random() * (cellCount - 0.00001));
      var positionY = Math.trunc(Math.random() * (cellCount - 0.00001));
      if(positionY + positionX == 0 || positionY + positionX == cellCount * 2 - 2
        || (positionX == 0 && positionY == cellCount -1)
        || (positionY == 0 && positionX == cellCount -1)
      ) {
        continue
      } else {
        i++;
      }

      this.get('obstacles').push([positionX, positionY]);
    }
  },

  generateField: function() {
    var ctx = field.getContext('2d');
    var border = this.get('border');
    var cellSize = this.get('cellSize');
    var cellCount = this.get('cellCount');
    var offset = border + cellSize / 2;
    this.set('offset', offset);

    // Backgorund
    field.width  = cellCount * cellSize + 2 * border;
    field.height = field.width;
    ctx.fillRect(0, 0, field.width, field.height);

    // Nav lines
    ctx.strokeStyle = 'white';
    ctx.lineWidth = cellSize / 10;
    for (var i = 0; i < cellCount; i++) {
      ctx.beginPath();
      ctx.moveTo(0, offset + cellSize * i);
      ctx.lineTo(field.width, offset + cellSize * i);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offset + cellSize * i, 0);
      ctx.lineTo(offset + cellSize * i, field.width);
      ctx.stroke();
    }

    // Borders
    ctx.lineWidth = border * 2;
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(0, 0, field.width, field.height);

    // Obstacles
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

      ctx.arc(offset + cellSize * positionX, offset + cellSize * positionY,
        cellSize * 0.4, 0, 2 * Math.PI, false);
      ctx.fill();

      ctx.stroke();
    }
  },

  getXZOf: function(x, y) {
    return [this.get('offset') + this.get('cellSize') * x,
      this.get('offset') + this.get('cellSize') * y];
  },

  displayDevices: function() {
    for (var key in this.get('devices')) {
      var device = this.get('devices')[key];

      if(!device.isReady())
        continue;

      device.draw(field);
    }
  },

  refresh: function() {
    this.generateField();
    this.displayDevices();
  },

  didInsertElement: function() {
    this.generateField();

    var i = 0;
    var cellCount = this.get('cellCount');

    for (var key in this.get('devices')) {
      i++;

      var device = this.get('devices')[key]
      var angle = Math.PI * i * 0.5;
      switch (i) {
        case 1:
          device.prepare(this.getXZOf(0,0), angle);
          break;
        case 2:
          device.prepare(this.getXZOf(0, cellCount - 1), angle);
          break;
        case 3:
          device.prepare(this.getXZOf(cellCount - 1, 0), angle);
          break;
        case 4:
          device.prepare(this.getXZOf(cellCount - 1, cellCount - 1), angle);
          break;
        default:

      }
    }
  },

  actions: {
    update: function() {
      this.refresh();
    },

    registerDevice: function(device) {
      this.get('devices')[device.getId()] = device;
    },
  }
});
