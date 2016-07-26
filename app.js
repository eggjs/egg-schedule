'use strict';

const loadSchedule = require('./lib/load_schedule');
const qs = require('querystring');
const path = require('path');

module.exports = app => {
  const schedules = loadSchedule(app);

  // for test purpose
  app.runSchedule = schedulePath => {
    if (!path.isAbsolute(schedulePath)) {
      schedulePath = path.join(app.config.baseDir, 'app/schedule', schedulePath);
    }
    schedulePath = require.resolve(schedulePath);
    let schedule;

    try {
      schedule = schedules[schedulePath];
      if (!schedule) {
        throw new Error(`Cannot find schedule ${schedulePath}`);
      }
    } catch (err) {
      err.message = `[egg-schedule] ${err.message}`;
      return Promise.reject(err);
    }

    // run with anonymous context
    const ctx = app.createAnonymousContext({
      method: 'SCHEDULE',
      url: `/__schedule?path=${schedulePath}&${qs.stringify(schedule.schedule)}`,
    });
    return schedule.task(ctx);
  };

  for (const s in schedules) {
    const schedule = schedules[s];
    if (schedule.schedule.disable) continue;

    const task = schedule.task;
    const key = schedule.key;
    app.coreLogger.info('[egg-schedule]: register schedule %s', key);
    app.messenger.on(key, () => {
      app.coreLogger.info('[egg-schedule]: get message %s', key);

      // run with anonymous context
      const ctx = app.createAnonymousContext({
        method: 'SCHEDULE',
        url: `/__schedule?path=${s}&${qs.stringify(schedule.schedule)}`,
      });

      const start = Date.now();
      task(ctx)
      .then(() => true) // succeed
      .catch(err => {
        err.message = `[egg-schedule] ${key} excute error. ${err.message}`;
        app.logger.error(err);
        return false;   // failed
      })
      .then(success => {
        const rt = Date.now() - start;
        const status = success ? 'succeed' : 'failed';
        app.coreLogger.info(`[egg-schedule] ${key} excute ${status}, used ${rt}ms`);
      });
    });
  }
};
