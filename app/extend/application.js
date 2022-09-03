'use strict';

const ScheduleWorker = require('../../lib/schedule_worker');
const SCHEDULE_WORKER = Symbol('application#scheduleWorker');

module.exports = {
  /**
   * @member agent#schedule
   */
  get scheduleWorker() {
    if (!this[SCHEDULE_WORKER]) {
      this[SCHEDULE_WORKER] = new ScheduleWorker(this);
    }
    return this[SCHEDULE_WORKER];
  },
};
