'use strict';

const Strategy = require('./timer');
const assert = require('assert');

module.exports = class AllStrategy extends Strategy {
  constructor(...args) {
    super(...args);
    assert(this.schedule.mode !== 'delay', `[egg-schedule] ${this.key} schedule.mode=delay is not supported`);
  }

  handler() {
    this.sendAll();
  }
};
