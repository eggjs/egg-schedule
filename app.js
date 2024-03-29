'use strict';

const qs = require('querystring');
const path = require('path');
const is = require('is-type-of');

module.exports = app => {
  const logger = app.getLogger('scheduleLogger');
  const scheduleWorker = app.scheduleWorker;
  scheduleWorker.init();

  // log schedule list
  for (const s in scheduleWorker.scheduleItems) {
    const schedule = scheduleWorker.scheduleItems[s];
    if (!schedule.schedule.disable) logger.info('[egg-schedule]: register schedule %s', schedule.key);
  }

  // register schedule event
  app.messenger.on('egg-schedule', async info => {
    const { id, key } = info;
    logger.debug(`[Job#${id}] ${key} await app ready`);
    await app.ready();
    const schedule = scheduleWorker.scheduleItems[key];
    logger.debug(`[Job#${id}] ${key} task received by app`);

    if (!schedule) {
      logger.warn(`[Job#${id}] ${key} unknown task`);
      return;
    }

    /* istanbul ignore next */
    if (schedule.schedule.disable) {
      logger.warn(`[Job#${id}] ${key} disable`);
      return;
    }

    logger.info(`[Job#${id}] ${key} executing by app`);

    // run with anonymous context
    const ctx = app.createAnonymousContext({
      method: 'SCHEDULE',
      url: `/__schedule?path=${key}&${qs.stringify(schedule.schedule)}`,
    });

    const start = Date.now();

    let success;
    let e;
    try {
      // execute
      await app.ctxStorage.run(ctx, async () => {
        return await schedule.task(ctx, ...info.args);
      });
      success = true;
    } catch (err) {
      success = false;
      e = is.error(err) ? err : new Error(err);
    }

    const rt = Date.now() - start;

    const msg = `[Job#${id}] ${key} execute ${success ? 'succeed' : 'failed'}, used ${rt}ms.`;
    logger[success ? 'info' : 'error'](msg, success ? '' : e);

    Object.assign(info, {
      success,
      workerId: process.pid,
      rt,
      message: e && e.message,
    });

    // notify agent job finish
    app.messenger.sendToAgent('egg-schedule', info);
  });

  // for test purpose
  const directory = [].concat(path.join(app.config.baseDir, 'app/schedule'), app.config.schedule.directory || []);
  app.runSchedule = (schedulePath, ...args) => {
    // resolve real path
    if (path.isAbsolute(schedulePath)) {
      schedulePath = require.resolve(schedulePath);
    } else {
      for (const dir of directory) {
        try {
          schedulePath = require.resolve(path.join(dir, schedulePath));
          break;
        } catch (_) {
          /* istanbul ignore next */
        }
      }
    }

    let schedule;

    try {
      schedule = scheduleWorker.scheduleItems[schedulePath];
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

    return app.ctxStorage.run(ctx, () => {
      return schedule.task(ctx, ...args);
    });
  };
};
