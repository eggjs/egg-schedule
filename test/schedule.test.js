'use strict';

const mm = require('egg-mock');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

describe('test/schedule.test.js', () => {
  let app;
  afterEach(() => app.close());

  describe('schedule type worker', () => {
    it('should support interval and cron', function* () {
      app = mm.cluster({ baseDir: 'worker', workers: 2, cache: false });
      yield app.ready();
      yield sleep(5000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
      assert(contains(log, 'cron') === 1);
    });

    it('should support context', function* () {
      app = mm.cluster({ baseDir: 'context', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      const log = getLogContent('context');
      // console.log(log);
      assert(/method: SCHEDULE/.test(log));
      assert(/path: \/__schedule/.test(log));
      assert(/(.*?)sub(\/|\\)cron\.js/.test(log));
      assert(/"type":"worker"/.test(log));
      assert(/"cron":"\*\/5 \* \* \* \* \*"/.test(log));
      assert(/hello busi/.test(log));
    });

    it('should support async', function* () {
      app = mm.cluster({ baseDir: 'async', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      const log = getLogContent('async');
      // console.log(log);
      assert(/method: SCHEDULE/.test(log));
      assert(/path: \/__schedule/.test(log));
      assert(/(.*?)sub(\/|\\)cron\.js/.test(log));
      assert(/"type":"worker"/.test(log));
      assert(/"cron":"\*\/5 \* \* \* \* \*"/.test(log));
      assert(/hello busi/.test(log));
    });

    it('should support immediate', function* () {
      app = mm.cluster({ baseDir: 'immediate', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      const log = getLogContent('immediate');
      // console.log(log);
      assert(contains(log, 'immediate-interval') >= 2);
      assert(contains(log, 'immediate-cron') >= 2);
    });
  });

  describe('schedule type all', () => {
    it('should support interval and cron', function* () {
      app = mm.cluster({ baseDir: 'all', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      const log = getLogContent('all');
      // console.log(log);
      assert(contains(log, 'interval') === 2);
      assert(contains(log, 'cron') === 2);
    });
  });

  describe('schedule in plugin', () => {
    it('should support interval and cron', function* () {
      app = mm.cluster({ baseDir: 'plugin', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      const log = getLogContent('plugin');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
      assert(contains(log, 'cron') === 1);
    });
  });

  describe('custom schedule type', () => {
    it('should work', function* () {
      app = mm.cluster({ baseDir: 'customType', workers: 2 });
      // app.debug();
      yield app.ready();
      yield sleep(5000);
      const log = getLogContent('customType');
      const errorLog = getErrorLogContent('customType');
      // console.log(log);
      assert(contains(log, 'custom_log') === 1);
      assert(contains(log, 'cluster_log') === 1);
      assert(contains(log, 'should not log this') === 0);
      assert(/schedule type \[error\] start is not implemented yet/.test(errorLog));
    });
  });

  describe('schedule config error', () => {
    it('should thrown', function* () {
      app = mm.cluster({ baseDir: 'scheduleError', workers: 2 });
      yield app.ready();
      yield sleep(1000);
      assert(/\[egg-schedule\] schedule\.interval or schedule\.cron must be present/.test(getErrorLogContent('scheduleError')));
    });
  });

  describe('schedule type undefined', () => {
    it('should thrown', function* () {
      app = mm.cluster({ baseDir: 'typeUndefined', workers: 2 });
      yield app.ready();
      yield sleep(1000);
      assert(/schedule type \[undefined\] is not defined/.test(getErrorLogContent('typeUndefined')));
    });
  });

  describe('schedule cron instruction invalid', () => {
    it('should thrown', function* () {
      app = mm.cluster({ baseDir: 'cronError', workers: 2 });
      yield app.ready();
      yield sleep(1000);
      assert(/parse cron instruction\(invalid instruction\) error/.test(getErrorLogContent('cronError')));
    });
  });

  describe('schedule excute error', () => {
    it('should thrown', function* () {
      app = mm.cluster({ baseDir: 'excuteError', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      const errorLog = getErrorLogContent('excuteError');
      assert(contains(errorLog, 'excute error') === 2);
    });
  });

  describe('app.runSchedule', () => {
    it('should run schedule not exist throw error', function* () {
      app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      try {
        yield app.runSchedule(__filename);
        yield sleep(1000);
        throw new Error('should not excute');
      } catch (err) {
        assert(err.message.includes('Cannot find schedule'));
      }
    });

    it('should run schedule by relative path success', function* () {
      app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      yield app.runSchedule('sub/cron');
      yield sleep(1000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'cron') === 1);
    });

    it('should run schedule by absolute path success', function* () {
      app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      const schedulePath = path.join(__dirname, 'fixtures/worker/app/schedule/sub/cron.js');
      yield app.runSchedule(schedulePath);
      yield sleep(1000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'cron') === 1);
    });

    it('should run schedule by absolute package path success', function* () {
      app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      // console.log(require.resolve('egg/node_modules/egg-logrotator/app/schedule/rotate_by_file.js'));
      yield app.runSchedule(require.resolve('egg/node_modules/egg-logrotator/app/schedule/rotate_by_file.js'));
    });
  });

  describe('stop schedule', () => {
    it('should stop schedule after app closed', function* () {
      app = mm.cluster({ baseDir: 'stop', workers: 2 });
      yield app.ready();
      yield sleep(10000);
      const log = getLogContent('stop');
      // console.log(log);
      assert(contains(log, 'interval') === 0);
    });
  });

  describe('dynamic schedule', () => {
    it('should support dynamic disable', function* () {
      app = mm.cluster({ baseDir: 'dynamic', workers: 2 });
      yield app.ready();
      yield sleep(5000);

      const log = getLogContent('dynamic');
      // console.log(log);
      assert(contains(log, 'interval') === 0);
      assert(contains(log, 'cron') === 1);
    });

    it('should support run disabled dynamic schedule', function* () {
      app = mm.app({ baseDir: 'dynamic', cache: false });
      yield app.ready();

      yield app.runSchedule('interval');
      yield sleep(1000);
      const log = getLogContent('dynamic');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
    });
  });

  describe('export schedules', () => {
    it('should export app.schedules', function* () {
      app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      assert(app.schedules);
    });
  });

  describe('safe-timers', () => {
    it('should support interval and cron', function* () {
      app = mm.cluster({ baseDir: 'safe-timers', workers: 2, cache: false });
      yield app.ready();
      yield sleep(5000);

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
});

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
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

function contains(content, match) {
  return content.split('\n').filter(line => line.indexOf(match) >= 0).length;
}
