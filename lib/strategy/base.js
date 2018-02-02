'use strict';

module.exports = class BaseStrategy {
  constructor(schedule, agent, key) {
    this.agent = agent;
    this.key = key;
    this.schedule = schedule;
  }

  start() {}

  sendOne(data) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.agent.coreLogger.warn(`[egg-schedule] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-schedule] send message to random worker: ${this.key}`);
    this.agent.messenger.sendRandom('egg-schedule', { key: this.key, data });
  }

  sendAll(data) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.agent.coreLogger.warn(`[egg-schedule] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-schedule] send message to all worker: ${this.key}`);
    this.agent.messenger.send('egg-schedule', { key: this.key, data });
  }
};
