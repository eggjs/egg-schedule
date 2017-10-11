'use strict';

const Strategy = require('../../lib/strategy/base');
const Schedule = require('../../lib/schedule');
const Timer = require('../../lib/timer');

const SCHEDULE = Symbol('agent#schedule');
const TIMER = Symbol('agent#scheduleTimer');

module.exports = {
  /**
   * @member agent#ScheduleStrategy
   */
  ScheduleStrategy: Strategy,

  /**
   * @member agent#schedule
   */
  get schedule() {
    if (!this[SCHEDULE]) {
      this[SCHEDULE] = new Schedule(this);
      this.beforeClose(() => {
        return this[SCHEDULE].close();
      });
    }
    return this[SCHEDULE];
  },

  /**
   * @member agent#scheduleTimer
   */
  get scheduleTimer() {
    if (!this[TIMER]) {
      this[TIMER] = new Timer(this);
      this.beforeClose(() => {
        return this[TIMER].close();
      });
    }
    return this[TIMER];
  },
};
