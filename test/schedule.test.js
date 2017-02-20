'use strict';

const mm = require('egg-mock');
const path = require('path');
const fs = require('fs');
require('should');

describe('test/schedule.test.js', () => {
  describe('schedule loader', () => {
    it('should load extension', function* () {
      const app = mm.cluster({ baseDir: 'loader', workers: 2 });
      yield app.ready();
      app.close();
      const log = getLogContent('loader');
      console.log(log);
      contains(log, 'jsfile').should.equal(1);
      contains(log, 'tsfile').should.equal(0);
      contains(log, 'dotfile').should.equal(0);
    });
  });
  describe('schedule type worker', () => {
    it('should support interval and cron', function* () {
      const app = mm.cluster({ baseDir: 'worker', workers: 2 });
      yield app.ready();
      console.log('app ready now !!!!!');
      yield sleep(5000);
      app.close();
      const log = getLogContent('worker');
      console.log(log);
      // because app.ready() is after agent.ready(), ci may need some more times
      contains(log, 'interval').should.within(2, 3);
      contains(log, 'cron').should.within(1, 2);
    });

    it('should support context', function* () {
      const app = mm.cluster({ baseDir: 'context', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      app.close();
      const log = getLogContent('context');
      console.log(log);
      log.should.match(/method: SCHEDULE/);
      log.should.match(/path: \/__schedule/);
      log.should.match(/(.*?)sub\/cron\.js/);
      log.should.match(/"type":"worker"/);
      log.should.match(/"cron":"\*\/5 \* \* \* \* \*"/);
      log.should.match(/hello busi/);
    });

    it('should support immediate', function* () {
      const app = mm.cluster({ baseDir: 'immediate', workers: 2 });
      yield app.ready();
      console.log('app ready now !!!!!');
      yield sleep(5000);
      app.close();
      const log = getLogContent('immediate');
      console.log(log);
      // because app.ready() is after agent.ready(), ci may need some more times
      contains(log, 'immediate-interval').should.within(2, 3);
      contains(log, 'immediate-cron').should.within(1, 2);
    });
  });

  describe('schedule type all', () => {
    it('should support interval and cron', function* () {
      const app = mm.cluster({ baseDir: 'all', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      app.close();
      const log = getLogContent('all');
      console.log(log);
      // because app.ready() is after agent.ready(), ci may need some more times
      contains(log, 'interval').should.within(4, 6);
      contains(log, 'cron').should.within(2, 4);
    });
  });

  describe('schedule in plugin', () => {
    it('should support interval and cron', function* () {
      const app = mm.cluster({ baseDir: 'plugin', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      app.close();
      const log = getLogContent('plugin');
      console.log(log);
      // because app.ready() is after agent.ready(), ci may need some more times
      contains(log, 'interval').should.within(2, 3);
      contains(log, 'cron').should.within(1, 2);
    });
  });

  describe('custom schedule type', () => {
    it('should set agent[SCHEDULE_HANDLER] work', function* () {
      const app = mm.cluster({ baseDir: 'customType', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      app.close();
      const log = getLogContent('customType');
      console.log(log);
      contains(log, 'custom').should.within(2, 3);
    });
  });

  describe('schedule config error', () => {
    it('should thrown', function* () {
      const app = mm.cluster({ baseDir: 'scheduleError', workers: 2 });
      yield app.ready();
      yield sleep(1000);
      getErrorLogContent('scheduleError').should.match(/\[egg-schedule\] schedule\.interval or schedule\.cron must be present/);
      app.close();
    });
  });

  describe('schedule type undefined', () => {
    it('should thrown', function* () {
      const app = mm.cluster({ baseDir: 'typeUndefined', workers: 2 });
      yield app.ready();
      yield sleep(1000);
      getErrorLogContent('typeUndefined').should.match(/schedule type \[undefined\] is not defined/);
      app.close();
    });
  });

  describe('schedule cron instruction invalid', () => {
    it('should thrown', function* () {
      const app = mm.cluster({ baseDir: 'cronError', workers: 2 });
      yield app.ready();
      yield sleep(1000);
      getErrorLogContent('cronError').should.match(/parse cron instruction\(invalid instruction\) error/);
      app.close();
    });
  });

  describe('schedule excute error', () => {
    it('should thrown', function* () {
      const app = mm.cluster({ baseDir: 'excuteError', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      app.close();
      const errorLog = getErrorLogContent('excuteError');
      contains(errorLog, 'excute error').should.within(2, 3);
    });
  });

  describe('app.runSchedule', () => {
    it('should run schedule not exist throw error', function* () {
      const app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      try {
        yield app.runSchedule(__filename);
        throw new Error('should not excute');
      } catch (err) {
        err.message.should.containEql('Cannot find schedule');
      }
      app.close();
    });

    it('should run schedule by relative path success', function* () {
      const app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      yield app.runSchedule('sub/cron');
      const log = getLogContent('worker');
      console.log(log);
      contains(log, 'cron').should.equal(1);
      app.close();
    });

    it('should run schedule by absolute path success', function* () {
      const app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      const schedulePath = path.join(__dirname, 'fixtures/worker/app/schedule/sub/cron.js');
      yield app.runSchedule(schedulePath);
      const log = getLogContent('worker');
      console.log(log);
      contains(log, 'cron').should.equal(1);
      app.close();
    });

    it('should run schedule by absolute package path success', function* () {
      const app = mm.app({ baseDir: 'worker', cache: false });
      yield app.ready();
      console.log(require.resolve('egg/node_modules/egg-logrotater/app/schedule/rotateByFile.js'));
      yield app.runSchedule(require.resolve('egg/node_modules/egg-logrotater/app/schedule/rotateByFile.js'));
      app.close();
    });
  });

  describe('stop schedule', () => {
    it('should stop schedule after app closed', function* () {
      const app = mm.cluster({ baseDir: 'stop', workers: 2 });
      yield app.ready();
      app.close();
      yield sleep(10000);
      const log = getLogContent('stop');
      console.log(log);
      contains(log, 'interval').should.equal(0);
    });
  });

  describe('dynamic schedule', () => {
    it('should support dynamic disable', function* () {
      const app = mm.cluster({ baseDir: 'dynamic', workers: 2 });
      yield app.ready();
      yield sleep(5000);
      app.close();
      const log = getLogContent('dynamic');
      console.log(log);
      // because app.ready() is after agent.ready(), ci may need some more times
      contains(log, 'interval').should.equal(0);
      contains(log, 'cron').should.within(1, 2);
    });

    it('should support run disabled dynamic schedule', function* () {
      const app = mm.app({ baseDir: 'dynamic', cache: false });
      yield app.ready();
      yield app.runSchedule('interval');

      const log = getLogContent('dynamic');
      console.log(log);
      contains(log, 'interval').should.equal(1);
      app.close();
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

function contains(content, match) {
  return content.split('\n').filter(line => line.indexOf(match) >= 0).length;
}
