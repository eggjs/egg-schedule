import { debuglog } from 'node:util';
import path from 'node:path';
import type {
  Application, ILifecycleBoot, EggLogger,
} from 'egg';
import { importResolve } from '@eggjs/utils';
import { ScheduleItem, ScheduleJobInfo } from './lib/types.js';

const debug = debuglog('@eggjs/schedule/app');

export default class Boot implements ILifecycleBoot {
  #app: Application;
  #logger: EggLogger;
  constructor(app: Application) {
    this.#app = app;
    this.#logger = app.getLogger('scheduleLogger');
  }

  async didLoad(): Promise<void> {
    const scheduleWorker = this.#app.scheduleWorker;
    await scheduleWorker.init();

    // log schedule list
    for (const s in scheduleWorker.scheduleItems) {
      const schedule = scheduleWorker.scheduleItems[s];
      if (!schedule.schedule.disable) {
        this.#logger.info('[@eggjs/schedule]: register schedule %s', schedule.key);
      }
    }

    // register schedule event
    this.#app.messenger.on('egg-schedule', async info => {
      debug('app got "egg-schedule" message: %o', info);
      const { id, key } = info;
      this.#logger.debug(`[Job#${id}] ${key} await app ready`);
      await this.#app.ready();
      const schedule = scheduleWorker.scheduleItems[key];
      this.#logger.debug(`[Job#${id}] ${key} task received by app`);

      if (!schedule) {
        this.#logger.warn(`[Job#${id}] ${key} unknown task`);
        return;
      }

      /* istanbul ignore next */
      if (schedule.schedule.disable) {
        this.#logger.warn(`[Job#${id}] ${key} disable`);
        return;
      }

      this.#logger.info(`[Job#${id}] ${key} executing by app`);

      // run with anonymous context
      const ctx = this.#app.createAnonymousContext({
        method: 'SCHEDULE',
        url: `/__schedule?path=${key}&${schedule.scheduleQueryString}`,
      });

      const start = Date.now();

      let success: boolean;
      let e: Error | undefined;
      try {
        // execute
        await this.#app.ctxStorage.run(ctx, async () => {
          return await schedule.task(ctx, ...info.args);
        });
        success = true;
      } catch (err: any) {
        success = false;
        e = err;
      }

      const rt = Date.now() - start;

      const msg = `[Job#${id}] ${key} execute ${success ? 'succeed' : 'failed'}, used ${rt}ms.`;
      if (success) {
        this.#logger.info(msg);
      } else {
        this.#logger.error(msg, e);
      }

      // notify agent job finish
      this.#app.messenger.sendToAgent('egg-schedule', {
        ...info,
        success,
        workerId: process.pid,
        rt,
        message: e?.message,
      } as ScheduleJobInfo);
    });

    // for test purpose
    const config = this.#app.config;
    const directory = [
      path.join(config.baseDir, 'app/schedule'),
      ...config.schedule.directory,
    ];
    const runSchedule = async (schedulePath: string, ...args: any[]) => {
      debug('[runSchedule] start schedulePath: %o, args: %o', schedulePath, args);

      // resolve real path
      if (path.isAbsolute(schedulePath)) {
        schedulePath = importResolve(schedulePath);
      } else {
        for (const dir of directory) {
          const trySchedulePath = path.join(dir, schedulePath);
          try {
            schedulePath = importResolve(trySchedulePath);
            break;
          } catch (err) {
            debug('[runSchedule] importResolve %o error: %s', trySchedulePath, err);
          }
        }
      }

      debug('[runSchedule] resolve schedulePath: %o', schedulePath);
      let schedule: ScheduleItem;
      try {
        schedule = scheduleWorker.scheduleItems[schedulePath];
        if (!schedule) {
          throw new Error(`Cannot find schedule ${schedulePath}`);
        }
      } catch (err: any) {
        err.message = `[@eggjs/schedule] ${err.message}`;
        throw err;
      }

      // run with anonymous context
      const ctx = this.#app.createAnonymousContext({
        method: 'SCHEDULE',
        url: `/__schedule?path=${schedulePath}&${schedule.scheduleQueryString}`,
      });
      return await this.#app.ctxStorage.run(ctx, async () => {
        return await schedule.task(ctx, ...args);
      });
    };
    Reflect.set(this.#app, 'runSchedule', runSchedule);

    debug('didLoad');
  }
}
