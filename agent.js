'use strict';

const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');

module.exports = agent => {
  const Schedule = require('./lib/schedule');
  const schedule = new Schedule(agent);

  const handlers = agent[SCHEDULE_HANDLER] = {};

  agent.messenger.once('egg-ready', () => {
    // Compatible
    for (const type of Object.keys(handlers)) {
      schedule.use(type, handler2Class(type, handlers[type]));
    }
    schedule.start();
  });

  function handler2Class(type, fn) {
    return class CustomStrategy extends Schedule.Strategy {
      constructor(...args) {
        super(...args);
        this.type = type;
      }
      start() {
        fn(this.scheduleInfo, {
          one: function() {
            this.agent.coreLogger.info(`[egg-schedule] send message to random worker: ${this.key}`);
            this.agent.messenger.sendRandom(this.key);
          }.bind(this),

          all: function() {
            this.agent.coreLogger.info(`[egg-schedule] send message to all worker: ${this.key}`);
            this.agent.messenger.send(this.key);
          }.bind(this),
        });
      }
      stop() {
        const err = new Error(`schedule type [${this.type}] is implement stop handler`);
        err.name = 'EggScheduleError';
        throw err;
      }
    };
  }
};
