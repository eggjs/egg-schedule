'use strict';

const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');
const Strategy = require('./base');

module.exports = class TimerStrategy extends Strategy {
  constructor(...args) {
    super(...args);
    this.interval = undefined;
    this.timer = undefined;
  }

  start(send) {
    const { interval, cron, immediate } = this.schedule;
    if (!interval && !cron) {
      throw new Error('[egg-schedule] schedule.interval or schedule.cron must be present');
    }

    if (interval) {
      this.interval = this.safeInterval(send, ms(interval));
    }

    if (cron) {
      let interval;
      try {
        // TODO: cronOptions
        interval = parser.parseExpression(cron);
      } catch (err) {
        err.message = `[egg-schedule] parse cron instruction(${cron}) error: ${err.message}`;
        throw err;
      }
      this.startCron(interval, send);
    }

    if (immediate) {
      setImmediate(send);
    }
  }

  close() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  startCron(interval, listener) {
    const now = Date.now();
    let nextTick;
    do {
      // TODO: try error when reach endDate
      nextTick = interval.next().getTime();
    } while (now >= nextTick);

    this.timer = this.safeTimeout(() => {
      listener();
      this.timer = this.startCron(interval, listener);
    }, nextTick - now);
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
