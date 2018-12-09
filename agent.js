'use strict';

const WorkerStrategy = require('./lib/strategy/worker');
const AllStrategy = require('./lib/strategy/all');

module.exports = agent => {
  // don't redirect scheduleLogger
  const logger = agent.getLogger('scheduleLogger');
  const errorLogger = agent.getLogger('errorLogger');
  logger.unredirect('error', errorLogger, { duplicate: true });

  // register built-in strategy
  agent.schedule.use('worker', WorkerStrategy);
  agent.schedule.use('all', AllStrategy);

  // wait for other plugin to register custom strategy
  agent.beforeStart(() => {
    agent.schedule.init();
  });

  // dispatch job finish event to strategy
  agent.messenger.on('egg-schedule', (...args) => {
    agent.schedule.onJobFinish(...args);
  });

  agent.messenger.once('egg-ready', () => {
    // start schedule after worker ready
    agent.schedule.start();
  });
};
