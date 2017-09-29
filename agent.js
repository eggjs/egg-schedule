'use strict';

const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');
const WorkerStrategy = require('./lib/strategy/worker');
const AllStrategy = require('./lib/strategy/all');

module.exports = agent => {
  // register built-in strategy
  agent.schedule.use('worker', WorkerStrategy);
  agent.schedule.use('all', AllStrategy);

  // TODO: compatible, will remove at next major
  const handlers = {};
  Object.defineProperty(agent, SCHEDULE_HANDLER, {
    get() {
      agent.deprecate('should use `agent.schedule.use()` instead of `agent[Symbol.for(\'egg#scheduleHandler\')]` to register handler.');
      return handlers;
    },
  });

  agent.messenger.once('egg-ready', () => {
    const keys = Object.keys(handlers);
    for (const type of keys) {
      agent.schedule.use(type, handler2Class(type, handlers[type]));
    }
    // start schedule
    agent.schedule.start();
  });

  function handler2Class(type, fn) {
    return class CustomStrategy extends agent.ScheduleStrategy {
      start() {
        fn(this.schedule, {
          one: this.sendOne.bind(this),
          all: this.sendAll.bind(this),
        });
      }
      close() {
        this.agent.logger.warn(`schedule type [${type}] stop is not implemented yet`);
      }
    };
  }
};
