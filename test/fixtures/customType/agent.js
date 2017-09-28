'use strict';

const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');

module.exports = function(agent) {
  agent[SCHEDULE_HANDLER].custom = function(schedule, sender) {
    setInterval(sender.one, schedule.interval);
  };

  class ClusterStrategy extends agent.ScheduleStrategy {
    start() {
      this.interval = setInterval(() => {
        this.sendOne();
      }, this.schedule.interval);
    }
    close() {
      if (this.interval) {
        this.clear(this.interval);
        this.interval = undefined;
      }
    }
  }
  agent.schedule.use('cluster', ClusterStrategy);

  agent.schedule.use('error', class ErrorStrategy extends agent.ScheduleStrategy {});
};
