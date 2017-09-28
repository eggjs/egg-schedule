'use strict';

const Strategy = require('./timer');

module.exports = class WorkerStrategy extends Strategy {
  start() {
    return super.start(() => this.sendOne());
  }
};
