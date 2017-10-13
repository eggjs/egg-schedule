'use strict';

const path = require('path');
const assert = require('assert');
const is = require('is-type-of');
const co = require('co');

module.exports = app => {
  const dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app/schedule'));
  const Loader = getScheduleLoader(app);
  const schedules = app.schedules = {};
  new Loader({
    directory: dirs,
    target: schedules,
    inject: app,
  }).load();
  return schedules;
};

function getScheduleLoader(app) {
  return class ScheduleLoader extends app.loader.FileLoader {
    load() {
      const target = this.options.target;
      const items = this.parse();
      for (const item of items) {
        const schedule = item.exports;
        const fullpath = item.fullpath;
        assert(schedule.schedule, `schedule(${fullpath}): must have schedule and task properties`);
        assert(is.class(schedule) || is.function(schedule.task), `schedule(${fullpath}: schedule.task should be function or schedule should be class`);

        let task;
        if (is.class(schedule)) {
          task = co.wrap(function* (ctx) {
            const s = new schedule(ctx);
            yield s.subscribe();
          });
        } else {
          task = co.wrap(schedule.task);
        }

        target[fullpath] = {
          schedule: schedule.schedule,
          task,
          key: fullpath,
        };
      }
    }
  };
}
