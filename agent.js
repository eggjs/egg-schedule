'use strict';

const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');
const WorkerStrategy = require('./lib/strategy/worker');
const AllStrategy = require('./lib/strategy/all');
const BaseStrategy = require('./lib/strategy/base');
const Schedule = require('./lib/schedule');

module.exports = agent => {
  const handlers = agent[SCHEDULE_HANDLER] = {};
  agent.schedule = new Schedule(agent);
  agent.ScheduleStrategy = BaseStrategy;

  agent.beforeClose(() => {
    return agent.schedule.close();
  });

  agent.messenger.once('egg-ready', () => {
    agent.schedule.use('worker', WorkerStrategy);
    agent.schedule.use('all', AllStrategy);
    //TODO: compatible, will remove at next major
    const keys = Object.keys(handlers);
    if (keys.length) agent.deprecate('should use `schedule.use()` instead of `agent[Symbol.for(\'egg#scheduleHandler\')]` to register handler.');
    for (const type of keys) {
      agent.schedule.use(type, handler2Class(type, handlers[type]));
    }
    agent.schedule.start();
  });

  function handler2Class(type, fn) {
    return class CustomStrategy extends BaseStrategy {
      constructor(...args) {
        super(...args);
        this.type = type;
      }
      start() {
        fn(this.schedule, {
          one: this.sendOne.bind(this),
          all: this.sendAll.bind(this),
        });
      }
    };
  }
};
