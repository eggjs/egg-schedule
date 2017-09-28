'use strict';

module.exports = class BaseStrategy {
  constructor(schedule, agent, key) {
    this.agent = agent;
    this.key = key;
    this.schedule = schedule;
  }

  sendOne() {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.agent.coreLogger.info(`[egg-schedule] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-schedule] send message to random worker: ${this.key}`);
    this.agent.messenger.sendRandom(this.key);
  }

  sendAll() {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.agent.coreLogger.info(`[egg-schedule] message ${this.key} did not sent`);
      return;
    }
    this.agent.coreLogger.info(`[egg-schedule] send message to all worker: ${this.key}`);
    this.agent.messenger.send(this.key);
  }

  /* istanbul ignore next */
  close() {
    /* istanbul ignore next */
    this.agent.logger.warn(`schedule type [${this.type}] stop is not implemented yet`);
  }
};
