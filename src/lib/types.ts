import type { ParserOptions as CronOptions } from 'cron-parser';
import type { Schedule } from './schedule.js';
import type { ScheduleWorker } from './schedule_worker.js';

/**
 * Schedule Config
 * @see https://www.eggjs.org/zh-CN/basics/schedule
 */
export interface EggScheduleConfig {
  type?: 'worker' | 'all';
  interval?: string | number;
  cron?: string;
  cronOptions?: CronOptions;
  immediate?: boolean;
  disable?: boolean;
  env?: string[];
}

export type EggScheduleTask = (ctx: any, ...args: any[]) => Promise<void>;

export interface EggScheduleItem {
  schedule: EggScheduleConfig;
  scheduleQueryString: string;
  task: EggScheduleTask;
  key: string;
}

export interface EggScheduleJobInfo {
  id: string;
  key: string;
  workerId: number;
  args: any[];
  success?: boolean;
  message?: string;
  rt?: number;
}

declare module 'egg' {
  export interface EggScheduleAgent {
    schedule: Schedule;
  }
  export interface Agent extends EggScheduleAgent {}

  export interface EggScheduleApplication {
    scheduleWorker: ScheduleWorker;
    /** runSchedule in unittest */
    runSchedule: (schedulePath: string, ...args: any[]) => Promise<void>;
  }
  export interface Application extends EggScheduleApplication {}

  export interface EggScheduleAppConfig {
    schedule: {
      directory: string[];
    };
  }

  export interface EggAppConfig extends EggScheduleAppConfig {}
}
