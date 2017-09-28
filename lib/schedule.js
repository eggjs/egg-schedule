'use strict';

const loadSchedule = require('./load_schedule');
const WorkerStrategy = require('./strategy/worker');
const AllStrategy = require('./strategy/all');
const Strategy = require('./strategy/base');

module.exports = class Schedule {
  constructor(agent) {
    this.agent = agent;
    this.handler = new Map();
    this.strategy = new Map();
    this.use('worker', WorkerStrategy);
    this.use('all', AllStrategy);
  }

  use(type, clz) {
    this.strategy.set(type, clz);
  }

  start() {
    this.agent.disableSchedule = false;
    const scheduleItems = loadSchedule(this.agent);

    for (const k of Object.keys(scheduleItems)) {
      const { key, schedule } = scheduleItems[k];
      const type = schedule.type;
      if (schedule.disable) continue;

      const Strategy = this.strategy.get(type);
      if (!Strategy) {
        const err = new Error(`schedule type [${type}] is not defined`);
        err.name = 'EggScheduleError';
        throw err;
      }

      const handler = new Strategy(this.agent, key, schedule);
      this.handler.set(key, handler);
      handler.start();
    }
  }
};

module.exports.Strategy = Strategy;
