'use strict';

const Strategy = require('./base');

module.exports = class AllStrategy extends Strategy {
  start() {
    this.agent.scheduleTimer.handler(this.key, this.schedule, () => this.sendAll());
  }
};
