'use strict';

const assert = require('assert');

module.exports = function(agent) {
  class ClusterStrategy extends agent.ScheduleStrategy {
    constructor(schedule, ...args) {
      assert(schedule.clusterId, 'should provide clusterId');
      super(schedule, ...args);
    }
    start() {
      this.interval = setInterval(() => {
        this.sendOne();
      }, this.schedule.interval);
    }
  }
  agent.schedule.use('cluster', ClusterStrategy);
};
