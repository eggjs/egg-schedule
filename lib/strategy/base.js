'use strict';

module.exports = class BaseStrategy {
  constructor(schedule, agent, key) {
    this.agent = agent;
    this.key = key;
    this.schedule = schedule;
    this.logger = this.agent.loggers.scheduleLogger;
  }

  start() {}

  sendOne(...args) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.logger.warn(`${this.key} skip due to schedule closed`);
      return;
    }
    const id = Date.now();
    this.logger.info(`${this.key} triggered, id: ${id}, send message to random worker`);
    this.agent.messenger.sendRandom('egg-schedule', { key: this.key, id, args });
  }

  sendAll(...args) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.logger.warn(`${this.key} skip due to schedule closed`);
      return;
    }
    const id = Date.now();
    this.logger.info(`${this.key} triggered, id: ${id}, send message to all worker`);
    this.agent.messenger.send('egg-schedule', { key: this.key, id, args });
  }
};
