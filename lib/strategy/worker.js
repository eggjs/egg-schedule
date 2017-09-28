'use strict';

const Strategy = require('./base');

module.exports = class WorkerStrategy extends Strategy {
  constructor(...args) {
    super(...args);
    this.type = 'worker';
  }

  send() {
    this.agent.coreLogger.info(`[egg-schedule] send message to random worker: ${this.key}`);
    this.agent.messenger.sendRandom(this.key);
  }
};
