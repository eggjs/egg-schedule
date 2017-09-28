'use strict';

const Strategy = require('./base');
const Timer = require('../timer');

module.exports = class WorkerStrategy extends Strategy {
  constructor(...args) {
    super(...args);
    this.timer = new Timer();
  }

  start() {
    this.timer.start(this.key, this.schedule, () => this.sendOne());
  }

  close() {
    this.timer.stop();
  }
};
