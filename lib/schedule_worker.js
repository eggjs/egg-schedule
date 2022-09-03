'use strict';

const loadSchedule = require('./load_schedule');

module.exports = class ScheduleWorker {
  constructor(app) {
    this.app = app;
    this.scheduleItems = {};
  }

  init() {
    this.scheduleItems = loadSchedule(this.app);
  }

  registerSchedule(scheduleItem) {
    const { key } = scheduleItem;
    this.scheduleItems[key] = scheduleItem;
  }

  unregisterSchedule(key) {
    delete this.scheduleItems[key];
  }
};
