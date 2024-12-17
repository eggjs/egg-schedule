import { strict as assert } from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { importResolve } from '@eggjs/utils';
import { mm, MockApplication } from 'egg-mock';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('test/schedule.test.ts', () => {
  let app: MockApplication;
  afterEach(() => app.close());

  describe('schedule type worker', () => {
    it('should support interval and cron', async () => {
      app = mm.cluster({ baseDir: 'worker', workers: 2, cache: false });
      app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('worker');
      console.log(log);
      assert.equal(contains(log, 'interval'), 1);
      assert.equal(contains(log, 'cron'), 1);

      const scheduleLog = getScheduleLogContent('worker');
      console.log(scheduleLog);
      assert.equal(contains(scheduleLog, 'cron.js executing by app'), 1);
      assert.equal(contains(scheduleLog, 'cron.js execute succeed'), 1);
      assert.equal(contains(scheduleLog, 'interval.js executing by app'), 1);
      assert.equal(contains(scheduleLog, 'interval.js execute succeed'), 1);
    });

    it('should support ctxStorage', async () => {
      app = mm.cluster({ baseDir: 'worker2', workers: 2, cache: false });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('worker2');
      // console.log(log);
      assert(contains(log, 'interval') === 1);
      assert(contains(log, 'foobar') === 1);

      const scheduleLog = getScheduleLogContent('worker2');
      // console.log(scheduleLog);
      assert(contains(scheduleLog, 'foobar.js executing by app') === 1);
      assert(contains(scheduleLog, 'foobar.js execute succeed') === 1);
      assert(contains(scheduleLog, 'interval.js executing by app') === 1);
      assert(contains(scheduleLog, 'interval.js execute succeed') === 1);
    });

    it('should support cronOptions', async () => {
      app = mm.cluster({ baseDir: 'cronOptions', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(8000);
      const log = getLogContent('cronOptions');
      const scheduleLog = getScheduleLogContent('cronOptions');
      // console.log(log);
      assert(contains(log, 'cron-options') >= 1);
      assert(/cron-options.js reach endDate, will stop/.test(scheduleLog));
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
      assert(contains(scheduleLog, 'cron.js execute succeed') === 2);
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
      assert.equal(contains(log, 'cluster_log'), 1);
    });

    it('should handler error', async () => {
      app = mm.cluster({ baseDir: 'customTypeError', workers: 2 });
      app.debug();
      await app.ready();
      await sleep(3000);
      // app.expect('code', 1);
      app.expect('stderr', /should provide clusterId/);
    });
  });

  describe('schedule config error', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'scheduleError', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(5000);
      app.expect('stderr', /`schedule\.interval` or `schedule\.cron` or `schedule\.immediate` must be present/);
    });
  });

  describe('schedule type undefined', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'typeUndefined', workers: 2 });
      await app.ready();
      await sleep(5000);
      app.expect('stderr', /schedule type \[undefined\] is not defined/);
    });
  });

  describe('schedule cron instruction invalid', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'cronError', workers: 2 });
      // app.debug();
      await app.ready();
      await sleep(1000);
      app.expect('stderr', /parse cron instruction\(invalid instruction\) error/);
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
      app = mm.cluster({ baseDir: 'executeError', workers: 1 });
      app.debug();
      await app.ready();
      await sleep(5000);
      const scheduleLog = getScheduleLogContent('executeError');
      assert.equal(contains(scheduleLog, 'interval.js execute failed'), 2);
    });
  });

  describe('schedule execute task is generator function', () => {
    it('should thrown', async () => {
      app = mm.cluster({ baseDir: 'executeError-task-generator', workers: 1 });
      app.debug();
      await app.ready();
      app.expect('stderr', /"task" generator function is not support, should use async function instead/);
    });
  });

  describe('schedule.registerSchedule', () => {
    it('should register succeed', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      const key = __filename;
      let scheduleCalled = false;
      const task = async () => {
        scheduleCalled = true;
      };
      const schedule = {
        key,
        task,
        schedule: {
          type: 'all',
          interval: 4000,
        },
      };
      (app as any).agent.schedule.registerSchedule(schedule);
      app.scheduleWorker.registerSchedule(schedule as any);

      await app.runSchedule(key);
      await sleep(1000);

      assert.equal(scheduleCalled, true);
    });

    it('should unregister succeed', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      const key = __filename;
      let scheduleCalled = false;
      const task = async () => {
        scheduleCalled = true;
      };
      const schedule = {
        key,
        task,
        schedule: {
          type: 'all',
          interval: 4000,
        },
      };
      (app as any).agent.schedule.registerSchedule(schedule);
      app.scheduleWorker.registerSchedule(schedule as any);

      (app as any).agent.schedule.unregisterSchedule(schedule.key);
      app.scheduleWorker.unregisterSchedule(schedule.key);

      let err: any;
      try {
        await app.runSchedule(key);
      } catch (e) {
        err = e;
      }
      assert.match(err.message, /Cannot find schedule/);
      assert.equal(scheduleCalled, false);
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
      } catch (err: any) {
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
      assert(contains(log, 'cron') >= 1);
    });

    it('should run schedule by absolute path success', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      const schedulePath = path.join(__dirname, 'fixtures/worker/app/schedule/sub/cron.js');
      await app.runSchedule(schedulePath);
      await sleep(1000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'cron') >= 1);
    });

    it('should run schedule by absolute package path success', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      await app.runSchedule(importResolve('egg-logrotator/app/schedule/rotate_by_file.js'));
    });

    it('should run schedule by relative path success at customDirectory', async () => {
      app = mm.app({ baseDir: 'customDirectory', cache: false });
      await app.ready();
      await app.runSchedule('custom');
      await sleep(1000);
      const log = getLogContent('customDirectory');
      // console.log(log);
      assert(contains(log, 'customDirectory') === 1);
    });

    it('should run schedule with args', async () => {
      app = mm.app({ baseDir: 'worker', cache: false });
      await app.ready();
      await app.runSchedule('sub/cron', 'test');
      await sleep(1000);
      const log = getLogContent('worker');
      // console.log(log);
      assert(contains(log, 'cron test') === 1);
    });

    it('should run schedule support ctxStorage', async () => {
      app = mm.app({ baseDir: 'worker2', cache: false });
      await app.ready();
      app.mockContext({
        tracer: {
          traceId: 'mock-trace-123',
        },
      });
      await app.runSchedule('sub/foobar', 'use app.logger.info should work');
      await sleep(5000);
      const log = getLogContent('worker2');
      // console.log(log);
      assert.match(log, / \[-\/127.0.0.1\/mock-trace-123\/[\d\.]+ms GET \/] foobar use app.logger.info should work/);
    });

    it('should run schedule with symlink js file success', async () => {
      if (!process.version.startsWith('v22.')) {
        // only work on Node.js >= v22
        return;
      }
      const realPath = path.join(__dirname, 'fixtures/symlink/realFile.js');
      const targetPath = path.join(__dirname, 'fixtures/symlink/runDir/app/schedule/realFile.js');
      try {
        fs.unlinkSync(targetPath);
      } catch {
        // ignore
      }
      try {
        fs.symlinkSync(realPath, targetPath);
      } catch {
        // ignore
      }

      app = mm.app({ baseDir: 'symlink/runDir', cache: false });
      await app.ready();
      await app.runSchedule('realFile');
      fs.unlinkSync(targetPath);
    });

    // it.skip('should run schedule with symlink ts file success', async () => {
    //   mm(process.env, 'EGG_TYPESCRIPT', 'true');
    //   require.extensions['.ts'] = require.extensions['.js'];

    //   const realPath = path.join(__dirname, 'fixtures/symlink/tsRealFile.ts');
    //   const targetPath = path.join(__dirname, 'fixtures/symlink/runDir/app/schedule/tsRealFile.ts');
    //   fs.symlinkSync(realPath, targetPath);

    //   app = mm.app({ baseDir: 'symlink/runDir', cache: false });
    //   await app.ready();
    //   try {
    //     await app.runSchedule('tsRealFile');
    //   } catch (err) {
    //     assert(false, 'should not throw Cannot find schedule error');
    //   }

    //   delete require.extensions['.ts'];
    //   fs.unlinkSync(targetPath);
    // });
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

  describe('export app.schedules', () => {
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
      app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('subscription');
      // console.log(log);
      assert.equal(contains(log, 'interval'), 1);
      assert.equal(contains(log, 'cron'), 1);
    });

    it('should throw error on generator function', async () => {
      app = mm.cluster({ baseDir: 'subscription-generator', workers: 2, cache: false });
      app.debug();
      await app.ready();
      await sleep(3000);
      app.expect('stderr', /"schedule" generator function is not support, should use async function instead/);
    });

    it('should support interval and cron when config.logger.enableFastContextLogger = true', async () => {
      app = mm.cluster({ baseDir: 'subscription-enableFastContextLogger', workers: 2, cache: false });
      app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('subscription-enableFastContextLogger');
      console.log(log);
      assert.equal(contains(log, 'interval'), 1);
      assert.equal(contains(log, 'cron'), 1);
      // 2022-12-11 16:44:55,009 INFO 22958 [-/127.0.0.1/15d62420-7930-11ed-86ce-31ec9c2e0d18/3ms SCHEDULE /__schedule
      assert.match(log, / INFO \w+ \[-\/127\.0\.0\.1\/\w+\-\w+\-\w+\-\w+\-\w+\/[\d\.]+ms SCHEDULE \/__schedule/);
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
      assert(contains(scheduleLog, 'undefined.js execute succeed') >= 1);
      assert(contains(scheduleLog, 'unittest.js execute succeed') >= 1);
      assert(contains(scheduleLog, 'local.js execute succeed') === 0);
    });
  });

  describe('customize directory', () => {
    it('should support env list', async () => {
      app = mm.cluster({ baseDir: 'customDirectory', workers: 2, cache: false });
      // app.debug();
      await app.ready();
      await sleep(5000);
      const log = getLogContent('customDirectory');
      // console.log(log);
      assert(contains(log, ' interval') === 1);
      assert(contains(log, ' customDirectory') === 1);

      const scheduleLog = getScheduleLogContent('customDirectory');
      assert(contains(scheduleLog, 'custom.js execute succeed') === 1);
      assert(contains(scheduleLog, 'interval.js execute succeed') === 1);
    });
  });

  describe('detect error', () => {
    it('should works', async () => {
      app = mm.cluster({ baseDir: 'detect-error', workers: 1, cache: false });
      // app.debug();
      await app.ready();
      await sleep(2000);

      const scheduleLog = getScheduleLogContent('detect-error');
      assert.equal(contains(scheduleLog, 'suc.js execute succeed'), 1);
      assert.equal(contains(scheduleLog, /fail.js execute failed, used [\d\.]+ms. fail/), 1);
      assert.equal(contains(scheduleLog, /error.js execute failed, used [\d\.]+ms. Error: some err/), 1);
    });
  });
});

function getCoreLogContent(name: string) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, 'egg-web.log');
  return fs.readFileSync(logPath, 'utf8');
}

function getLogContent(name: string) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, `${name}-web.log`);
  return fs.readFileSync(logPath, 'utf8');
}

function getAgentLogContent(name: string) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, 'egg-agent.log');
  return fs.readFileSync(logPath, 'utf8');
}

function getScheduleLogContent(name: string) {
  const logPath = path.join(__dirname, 'fixtures', name, 'logs', name, 'egg-schedule.log');
  return fs.readFileSync(logPath, 'utf8');
}

function contains(content: string, match: string | RegExp) {
  return content.split('\n').filter(line => {
    return match instanceof RegExp ? match.test(line) : line.indexOf(match) >= 0;
  }).length;
}
