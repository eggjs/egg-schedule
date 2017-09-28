'use strict';

const Strategy = require('./base');

module.exports = class WorkerStrategy extends Strategy {
  constructor(...args) {
    super(...args);
    this.type = 'all';
  }

  send() {
    this.agent.coreLogger.info(`[egg-schedule] send message to all worker: ${this.key}`);
    this.agent.messenger.send(this.key);
  }
};
