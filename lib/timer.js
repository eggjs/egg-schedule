'use strict';

const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');

class Timer {
  constructor() {
    this.interval = new Map();
    this.timer = new Map();
  }

  start(key, schedule, cb) {
    const { interval, cron, immediate } = schedule;
    if (!interval && !cron) {
      throw new Error('[egg-schedule] schedule.interval or schedule.cron must be present');
    }

    let tid;

    if (interval) {
      tid = this.safeInterval(cb, ms(interval));
      this.interval.set(key, tid);
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
      this.startCron(key, interval, cb);
    }

    if (immediate) {
      setImmediate(cb);
    }
  }

  stop() {
    for (const tid of this.interval.values()) {
      clearInterval(tid);
    }
    this.interval.clear();

    for (const tid of this.timer.values()) {
      clearTimeout(tid);
    }
    this.timer.clear();
  }

  startCron(key, interval, listener) {
    const now = Date.now();
    let nextTick;
    do {
      // TODO: try error when reach endDate
      nextTick = interval.next().getTime();
    } while (now >= nextTick);

    const tid = this.safeTimeout(() => {
      listener();
      this.startCron(key, interval, listener);
    }, nextTick - now);

    this.timer.set(key, tid);
  }

  safeTimeout(handler, delay, ...args) {
    const fn = delay < safetimers.maxInterval ? setTimeout : safetimers.setTimeout;
    return fn(handler, delay, ...args);
  }

  safeInterval(handler, delay, ...args) {
    const fn = delay < safetimers.maxInterval ? setInterval : safetimers.setInterval;
    return fn(handler, delay, ...args);
  }
}

module.exports = Timer;
