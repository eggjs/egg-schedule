'use strict';

const mm = require('egg-mock');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

describe('test/schedule.test.js', () => {
  let app;
  afterEach(() => app.close());

  describe('schedule type worker', () => {
    it('should support interval and cron', async () => {
      app = mm.cluster({ baseDir: 'worker', workers: 2, cache: false });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
      assert(contains(log, 'cron') === 1);

      const scheduleLog = getScheduleLogContent('worker');
      assert(contains(scheduleLog, 'cron.js triggered') === 1);
      assert(contains(scheduleLog, 'cron.js execute succeed') === 1);
      assert(contains(scheduleLog, 'interval.js triggered') === 1);
      assert(contains(scheduleLog, 'interval.js execute succeed') === 1);
    });

    it('should support cronOptions', async () => {
      app = mm.cluster({ baseDir: 'cronOptions', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(8000);
      const log = getLogContent('cronOptions');
      const agentLog = getAgentLogContent('cronOptions');
      // console.log(log);
      assert(contains(log, 'cron-options') >= 1);
      assert(/cron-options.js reach endDate, will stop/.test(agentLog));
    });

    it('should support context', async () => {
      app = mm.cluster({ baseDir: 'context', workers: 2 });
      await app.ready();
      await sleep(5000);
      const log = getLogContent('context');
      // console.log(log);
      assert(/method: SCHEDULE/.test(log));
      assert(/path: \/__schedule/.test(log));
      assert(/(.*?)sub(\/|\\)cron\.js/.test(log));
      assert(/"type":"worker"/.test(log));
      assert(/"cron":"\*\/5 \* \* \* \* \*"/.test(log));
      assert(/hello busi/.test(log));
    });

    it('should support async', async () => {
      app = mm.cluster({ baseDir: 'async', workers: 2 });
      await app.ready();
      await sleep(5000);
      const log = getLogContent('async');
      // console.log(log);
      assert(/method: SCHEDULE/.test(log));
      assert(/path: \/__schedule/.test(log));
      assert(/(.*?)sub(\/|\\)cron\.js/.test(log));
      assert(/"type":"worker"/.test(log));
      assert(/"cron":"\*\/5 \* \* \* \* \*"/.test(log));
      assert(/hello busi/.test(log));
    });

    it('should support generator', async () => {
      app = mm.cluster({ baseDir: 'generator', workers: 2 });
      await app.ready();
      await sleep(5000);
      const log = getLogContent('generator');
      // console.log(log);
      assert(/method: SCHEDULE/.test(log));
      assert(/path: \/__schedule/.test(log));
      assert(/(.*?)sub(\/|\\)cron\.js/.test(log));
      assert(/"type":"worker"/.test(log));
      assert(/"cron":"\*\/5 \* \* \* \* \*"/.test(log));
      assert(/hello busi/.test(log));
    });

    it('should support immediate', async () => {
      app = mm.cluster({ baseDir: 'immediate', workers: 2 });
      await app.ready();
      await sleep(5000);
      const log = getLogContent('immediate');
      // console.log(log);
      assert(contains(log, 'immediate-interval') >= 2);
      assert(contains(log, 'immediate-cron') >= 2);
    });

    it('should support immediate-onlyonce', async () => {
      app = mm.cluster({ baseDir: 'immediate-onlyonce', workers: 2 });
      await app.ready();
      await sleep(1000);
      const log = getLogContent('immediate-onlyonce');
      // console.log(log);
      assert(contains(log, 'immediate-onlyonce') === 1);
    });
  });

  describe('schedule type all', () => {
    it('should support interval and cron', async () => {
      app = mm.cluster({ baseDir: 'all', workers: 2 });
      await app.ready();
      await sleep(5000);
      const log = getLogContent('all');
      // console.log(log);
      assert(contains(log, 'interval') === 2);
      assert(contains(log, 'cron') === 2);

      const scheduleLog = getScheduleLogContent('all');
      assert(contains(scheduleLog, 'cron.js triggered') === 1);
      assert(contains(scheduleLog, 'cron.js execute succeed') === 2);
      assert(contains(scheduleLog, 'interval.js triggered') === 1);
      assert(contains(scheduleLog, 'interval.js execute succeed') === 2);
    });
  });

  describe('schedule in plugin', () => {
    it('should support interval and cron', async () => {
      app = mm.cluster({ baseDir: 'plugin', workers: 2 });
      await app.ready();
      await sleep(5000);
      const log = getLogContent('plugin');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
      assert(contains(log, 'cron') === 1);
    });
  });

  describe('custom schedule type', () => {
    it('should work', async () => {
      app = mm.cluster({ baseDir: 'customType', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('customType');
      // console.log(log);
      assert(contains(log, 'cluster_log') === 1);
    });

    it('should work at plugin', async () => {
      app = mm.cluster({ baseDir: 'customTypePlugin', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('customTypePlugin');
      // console.log(log);
      assert(contains(log, 'cluster_log') === 1);
    });

    it('should work without start', async () => {
      app = mm.cluster({ baseDir: 'customTypeWithoutStart', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('customTypeWithoutStart');
      // console.log(log);
      assert(contains(log, 'cluster_log') === 1);
    });

    it('should handler error', async () => {
      app = mm.cluster({ baseDir: 'customTypeError', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(1000);
      app.expect('code', 1);
      app.expect('stderr', /should provide clusterId/);
    });
  });

  describe('schedule config error', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'scheduleError', workers: 2 });
      await app.ready();
      await sleep(1000);
      assert(/\[egg-schedule\] schedule\.interval or schedule\.cron or schedule\.immediate must be present/.test(getErrorLogContent('scheduleError')));
    });
  });

  describe('schedule type undefined', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'typeUndefined', workers: 2 });
      await app.ready();
      await sleep(1000);
      app.expect('stderr', /schedule type \[undefined\] is not defined/);
    });
  });

  describe('schedule cron instruction invalid', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'cronError', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(1000);
      assert(/parse cron instruction\(invalid instruction\) error/.test(getErrorLogContent('cronError')));
    });
  });

  describe('schedule unknown task', () => {
    it('should skip', async () => {
      app = mm.cluster({ baseDir: 'unknown', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(3000);
      assert(getScheduleLogContent('unknown').match(/no-exist unknown task/));
    });
  });

  describe('schedule execute error', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'executeError', workers: 2 });
      await app.ready();
      await sleep(5000);
      const errorLog = getErrorLogContent('executeError');
      assert(contains(errorLog, 'execute error') === 2);
      const scheduleLog = getScheduleLogContent('executeError');
      assert(contains(scheduleLog, 'execute error') === 2);
    });
  });

  describe('app.runSchedule', () => {
    it('should run schedule not exist throw error', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      try {
        await app.runSchedule(__filename);
        await sleep(1000);
        throw new Error('should not execute');
      } catch (err) {
        assert(err.message.includes('Cannot find schedule'));
      }
    });

    it('should run schedule by relative path success', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      await app.runSchedule('sub/cron');
      await sleep(1000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'cron') === 1);
    });

    it('should run schedule by absolute path success', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      const schedulePath = path.join(__dirname, 'fixtures/worker/app/schedule/sub/cron.js');
      await app.runSchedule(schedulePath);
      await sleep(1000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'cron') === 1);
    });

    it('should run schedule by absolute package path success', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      // console.log(require.resolve('egg/node_modules/egg-logrotator/app/schedule/rotate_by_file.js'));
      await app.runSchedule(require.resolve('egg/node_modules/egg-logrotator/app/schedule/rotate_by_file.js'));
    });
  });

  describe('stop schedule', () => {
    it('should stop schedule after app closed', async () => {
      app = mm.cluster({ baseDir: 'stop', workers: 2 });
      await app.ready();
      await sleep(10000);
      const log = getLogContent('stop');
      // console.log(log);
      assert(contains(log, 'interval') === 0);
    });
  });

  describe('dynamic schedule', () => {
    it('should support dynamic disable', async () => {
      app = mm.cluster({ baseDir: 'dynamic', workers: 2 });
      await app.ready();
      await sleep(5000);

      const log = getLogContent('dynamic');
      // console.log(log);
      assert(contains(log, 'interval') === 0);
      assert(contains(log, 'cron') === 1);
    });

    it('should support run disabled dynamic schedule', async () => {
      app = mm.app({ baseDir: 'dynamic', cache: false });
      await app.ready();

      await app.runSchedule('interval');
      await sleep(1000);
      const log = getLogContent('dynamic');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
    });
  });

  describe('export schedules', () => {
    it('should export app.schedules', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      assert(app.schedules);
    });
  });

  describe('safe-timers', () => {
    it('should support interval and cron', async () => {
      app = mm.cluster({ baseDir: 'safe-timers', workers: 2, cache: false });
      await app.ready();
      await sleep(5000);

      const log = getLogContent('safe-timers');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
      assert(contains(log, 'cron') === 1);

      const agentLog = getAgentLogContent('safe-timers');
      // console.log(agentLog);
      assert(contains(agentLog, 'reschedule 4321') === 2);
      assert(contains(agentLog, 'reschedule') >= 4);
    });
  });

  describe('Subscription', () => {
    it('should support interval and cron', async () => {
      app = mm.cluster({ baseDir: 'subscription', workers: 2, cache: false });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('subscription');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
      assert(contains(log, 'cron') === 1);
    });
  });

  describe('send with params', () => {
    describe('custom schedule type', () => {
      it('should work', async () => {
        app = mm.cluster({ baseDir: 'customTypeParams', workers: 2 });
        // app.debug();
        await app.ready();
        await sleep(5000);
        const log = getLogContent('customTypeParams');
        // console.log(log);
        assert(contains(log, 'cluster_log { foo: \'worker\' }') === 1);
        assert(contains(log, 'cluster_all_log { foo: \'all\' }') === 2);
        assert(contains(log, 'cluster_log_clz { foo: \'worker\' }') === 1);
        assert(contains(log, 'cluster_all_log_clz { foo: \'all\' }') === 2);
      });
    });
  });

  describe('schedule.env', () => {
    it('should support env list', async () => {
      app = mm.cluster({ baseDir: 'env', workers: 2, cache: false });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getCoreLogContent('env');
      // console.log(log);
      assert(log.match(/ignore schedule .*local\.js/));

      const scheduleLog = getScheduleLogContent('env');
      assert(contains(scheduleLog, 'undefined.js triggered') >= 1);
      assert(contains(scheduleLog, 'unittest.js triggered') >= 1);
      assert(contains(scheduleLog, 'local.js triggered') === 0);
    });
  });
});

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

function getCoreLogContent(name) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, 'egg-web.log');
  return fs.readFileSync(logPath, 'utf8');
}

function getLogContent(name) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, `${name}-web.log`);
  return fs.readFileSync(logPath, 'utf8');
}

function getErrorLogContent(name) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, 'common-error.log');
  return fs.readFileSync(logPath, 'utf8');
}

function getAgentLogContent(name) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, 'egg-agent.log');
  return fs.readFileSync(logPath, 'utf8');
}

function getScheduleLogContent(name) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, 'egg-schedule.log');
  return fs.readFileSync(logPath, 'utf8');
}

function contains(content, match) {
  return content.split('\n').filter(line => line.indexOf(match) >= 0).length;
}
