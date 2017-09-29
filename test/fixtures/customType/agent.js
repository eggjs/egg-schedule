'use strict';

const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');

module.exports = function(agent) {
  agent[SCHEDULE_HANDLER].custom = function(schedule, sender) {
    setInterval(sender.one, schedule.interval);
  };

  class ClusterStrategy extends agent.ScheduleStrategy {
    constructor(...args) {
      super(...args);
      this.interval = setInterval(() => {
        this.sendOne();
      }, this.schedule.interval);
    }
  }
  agent.schedule.use('cluster', ClusterStrategy);
};
