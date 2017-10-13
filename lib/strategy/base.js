'use strict';

module.exports = class BaseStrategy {
  constructor(schedule, agent, key) {
    this.agent = agent;
    this.key = key;
    this.schedule = schedule;
  }

  start() {}

  sendOne() {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.agent.coreLogger.warn(`[egg-schedule] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-schedule] send message to random worker: ${this.key}`);
    this.agent.messenger.sendRandom('egg-schedule', { key: this.key });
  }

  sendAll() {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.agent.coreLogger.warn(`[egg-schedule] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-schedule] send message to all worker: ${this.key}`);
    this.agent.messenger.send('egg-schedule', { key: this.key });
  }
};
