'use strict';

const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');

module.exports = function(agent) {
  agent[SCHEDULE_HANDLER].custom = function(schedule, sender) {
    setInterval(sender.one, schedule.interval);
  };
};
