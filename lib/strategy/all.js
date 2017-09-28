'use strict';

const Strategy = require('./timer');

module.exports = class WorkerStrategy extends Strategy {
  send() {
    this.sendAll();
  }
};
