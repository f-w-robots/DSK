import Ember from 'ember';

export default Ember.Component.extend(Ember.Evented, {
  devices: {},
  obstacles: null,
  offset: null,

  generateObstacles: function() {
    var cellCount = this.get('cellCount');

    this.set('obstacles', []);
    return
    for(var i = 0; i < cellCount;) {
      var positionX = Math.trunc(Math.random() * (cellCount - 0.00001));
      var positionY = Math.trunc(Math.random() * (cellCount - 0.00001));
      if(positionY + positionX == 0 || positionY + positionX == cellCount * 2 - 2
        || (positionX == 0 && positionY == cellCount -1)
        || (positionY == 0 && positionX == cellCount -1)
        // TODO - dublicates
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

    field.width  = cellCount * cellSize + 2 * border;
    field.height = field.width;
    ctx.fillRect(0, 0, field.width, field.height);
    ctx.lineWidth = border * 2;
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(0, 0, field.width, field.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = cellSize / 10;

    for (var i = 0; i < cellCount; i++) {

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

      if(!device.getPosition())
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

    for (var key in this.get('devices')) {
      var device = this.get('devices')[key]
      if(device.getId() == 1) {
        device.setPosition(this.getXZOf(0,0), Math.PI * device.getId() * 0.5);
      } else if (device.getId() == 2) {
        device.setPosition(this.getXZOf(this.get('cellCount') - 1, this.get('cellCount') - 1), Math.PI * device.getId() * 0.5 );
      } else if (device.getId() == 3) {
        device.setPosition(this.getXZOf(this.get('cellCount') - 1, 0), Math.PI * device.getId() * 0.5 );
      } else if (device.getId() == 4) {
        device.setPosition(this.getXZOf(0, this.get('cellCount') - 1), Math.PI * device.getId() * 0.5 );
      }
    }

    this.send('update');
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
