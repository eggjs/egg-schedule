'use strict';

const STRATEGY = Symbol('strategy');
const HANDLER = Symbol('handler');
const assert = require('assert');
const loadSchedule = require('./load_schedule');

module.exports = class Schedule {
  constructor(agent) {
    this.agent = agent;
    this[STRATEGY] = new Map();
    this[HANDLER] = new Map();
  }

  use(type, clz) {
    assert(typeof clz.prototype.start === 'function', `schedule type [${type}] should implement \`start\` method`)
    clz.prototype.type = type;
    this[STRATEGY].set(type, clz);
  }

  start() {
    this.closed = false;
    const scheduleItems = loadSchedule(this.agent);

    for (const k of Object.keys(scheduleItems)) {
      const { key, schedule } = scheduleItems[k];
      const type = schedule.type;
      if (schedule.disable) continue;

      const Strategy = this[STRATEGY].get(type);
      if (!Strategy) {
        const err = new Error(`schedule type [${type}] is not defined`);
        err.name = 'EggScheduleError';
        throw err;
      }

      const handler = new Strategy(schedule, this.agent, key);
      this[HANDLER].set(key, handler);
      handler.start();
    }
  }

  close() {
    this.closed = true;
    for (const handler of this[HANDLER].values()) {
      handler.close();
    }
    this.agent.coreLogger.info('[egg-schedule] close tasks.');
  }
};
