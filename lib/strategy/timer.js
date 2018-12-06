'use strict';

const Strategy = require('./base');
const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');
const assert = require('assert');
const utility = require('utility');
const CRON_INSTANCE = Symbol('cron_instance');

module.exports = class TimerStrategy extends Strategy {
  constructor(...args) {
    super(...args);

    const { interval, cron, cronOptions, immediate, mode } = this.schedule;
    assert(interval || cron || immediate, `[egg-schedule] ${this.key} schedule.interval or schedule.cron or schedule.immediate must be present`);
    assert(!mode || mode === 'rate' || mode === 'delay', `[egg-schedule] ${this.key} schedule.mode only support: [ undefined, rate, delay ]`);

    // init cron parser
    if (cron) {
      try {
        this[CRON_INSTANCE] = parser.parseExpression(cron, cronOptions);
      } catch (err) {
        err.message = `[egg-schedule] ${this.key} parse cron instruction(${cron}) error: ${err.message}`;
        throw err;
      }
    }
  }

  // should override to handler
  handler() {}

  start() {
    if (this.schedule.immediate) {
      this.logger.info(`[Timer] ${this.key} next time will execute immediate`);
      setImmediate(() => this.handler());
    } else {
      this._scheduleNext();
    }
  }

  _scheduleNext() {
    if (this.agent.schedule.closed) return;

    // get next tick
    const nextTick = this.getNextTick();

    if (nextTick) {
      this.logger.info(`[Timer] ${this.key} next time will execute after ${nextTick}ms at ${utility.logDate(new Date(Date.now() + nextTick))}`);
      this.safeTimeout(() => this.handler(), nextTick);
    } else {
      this.logger.info(`[Timer] ${this.key} reach endDate, will stop`);
    }
  }

  onJobStart() {
    // rate mode, so start next schedule just after last one start
    if (!this.schedule.mode || this.schedule.mode === 'rate') {
      process.nextTick(() => this._scheduleNext());
    }
  }

  onJobFinish() {
    // delay mode, only start next schedule after last one finish
    if (this.schedule.mode === 'delay') {
      process.nextTick(() => this._scheduleNext());
    }
  }

  /**
   * calculate next tick
   *
   * @return {Number} time interval, if out of range then return `undefined`
   */
  getNextTick() {
    // interval-style
    if (this.schedule.interval) return ms(this.schedule.interval);

    // cron-style
    if (this[CRON_INSTANCE]) {
      // calculate next cron tick
      const now = Date.now();
      let nextTick;
      let nextInterval;

      // loop to find next feature time
      do {
        try {
          nextInterval = this[CRON_INSTANCE].next();
          nextTick = nextInterval.getTime();
        } catch (err) {
          // Error: Out of the timespan range
          return;
        }
      } while (now >= nextTick);

      return nextTick - now;
    }
  }

  safeTimeout(handler, delay, ...args) {
    const fn = delay < safetimers.maxInterval ? setTimeout : safetimers.setTimeout;
    return fn(handler, delay, ...args);
  }

  safeInterval(handler, delay, ...args) {
    const fn = delay < safetimers.maxInterval ? setInterval : safetimers.setInterval;
    return fn(handler, delay, ...args);
  }
};
