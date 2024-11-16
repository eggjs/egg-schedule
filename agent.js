'use strict';

const WorkerStrategy = require('./lib/strategy/worker');
const AllStrategy = require('./lib/strategy/all');
const RedisLock = require('./lib/lock/redis_lock');

module.exports = agent => {
  // register built-in strategy
  agent.schedule.use('worker', WorkerStrategy);
  agent.schedule.use('all', AllStrategy);

  // wait for other plugin to register custom strategy
  agent.beforeStart(() => {
    agent.schedule.init();
    if (agent?.config?.schedule?.cluster?.enable) {
      if (
        agent.config.schedule.cluster.lockType === 'redis' &&
        agent.config.schedule.cluster.redis
      ) {
        agent.lockManager = new RedisLock(agent);
      }
    }
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
