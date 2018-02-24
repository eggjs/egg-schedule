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
    const id = this.getSeqId();
    this.logger.info(`[${id}] ${this.key} triggered, send random by agent`);
    this.agent.messenger.sendRandom('egg-schedule', { key: this.key, id, args });
  }

  sendAll(...args) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.logger.warn(`${this.key} skip due to schedule closed`);
      return;
    }
    const id = this.getSeqId();
    this.logger.info(`[${id}] ${this.key} triggered, send all by agent`);
    this.agent.messenger.send('egg-schedule', { key: this.key, id, args });
  }

  getSeqId() {
    return `${Date.now()}${process.hrtime().join('')}`;
  }
};
