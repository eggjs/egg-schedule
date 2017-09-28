'use strict';

const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');

module.exports = class BaseStrategy {
  constructor(agent, key, scheduleInfo) {
    this.agent = agent;
    this.key = key;
    this.scheduleInfo = scheduleInfo;
    this.interval = undefined;
    this.timer = undefined;
  }

  start() {
    const { interval, cron, immediate } = this.scheduleInfo;
    if (!interval && !cron) {
      throw new Error('[egg-schedule] schedule.interval or schedule.cron must be present');
    }

    const send = () => {
      if (this.agent.disableSchedule) {
        this.agent.coreLogger.info(`[egg-schedule] message ${this.key} did not sent`);
        return;
      }
      this.send();
    };

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

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  send() {
  }

  startCron(interval, listener, done) {
    const now = Date.now();
    let nextTick;
    try {
      do {
        // TODO: try
        nextTick = interval.next().getTime();
      } while (now >= nextTick);
    } catch (err) {
      return done(err);
    }

    this.timer = this.safeTimeout(() => {
      listener();
      this.timer = this.startCron(interval, listener, done);
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
