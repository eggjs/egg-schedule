'use strict';

const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');

class Timer {
  constructor(agent) {
    this.agent = agent;
    this.interval = new Map();
    this.timer = new Map();
  }

  /**
   * start a timer to handler special schedule
   * @param {String} key - schedule key
   * @param {Object} schedule - schedule config `{ interval, cron, cronOptions, immediate}`
   * @param {Function} listener - sender handler
   */
  handler(key, schedule, listener) {
    const { interval, cron, cronOptions, immediate } = schedule;
    if (!interval && !cron) {
      throw new Error('[egg-schedule] schedule.interval or schedule.cron must be present');
    }

    if (interval) {
      const tid = this.safeInterval(listener, ms(interval));
      this.interval.set(key, tid);
    }

    if (cron) {
      let interval;
      try {
        interval = parser.parseExpression(cron, cronOptions);
      } catch (err) {
        err.message = `[egg-schedule] parse cron instruction(${cron}) error: ${err.message}`;
        throw err;
      }
      this.startCron(key, interval, listener);
    }

    if (immediate) {
      setImmediate(listener);
    }
  }

  /**
   * clean all timers
   */
  close() {
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
    try {
      do {
        nextTick = interval.next().getTime();
      } while (now >= nextTick);
    } catch (err) {
      // when reach endDate
      this.agent.coreLogger.warn(`[egg-schedule] ${key} reach endDate, will stop.`);
      return;
    }

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
