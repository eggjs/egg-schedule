import type { ParserOptions as CronOptions } from 'cron-parser';
import type { Schedule } from './schedule.js';
import type { ScheduleWorker } from './schedule_worker.js';

/**
 * Schedule Config
 * @see https://www.eggjs.org/zh-CN/basics/schedule
 */
export interface ScheduleConfig {
  type?: 'worker' | 'all';
  interval?: string | number;
  cron?: string;
  cronOptions?: CronOptions;
  immediate?: boolean;
  disable?: boolean;
  env?: string[];
}

export type ScheduleTask = (ctx: any, ...args: any[]) => Promise<void>;

export interface ScheduleItem {
  schedule: ScheduleConfig;
  scheduleQueryString: string;
  task: ScheduleTask;
  key: string;
}

export interface ScheduleJobInfo {
  id: string;
  key: string;
  workerId: number;
  args: any[];
  success?: boolean;
  message?: string;
  rt?: number;
}

declare module 'egg' {
  export interface ScheduleAgent {
    schedule: Schedule;
  }
  export interface Agent extends ScheduleAgent {}

  export interface ScheduleApplication {
    scheduleWorker: ScheduleWorker;
    /** runSchedule in unittest */
    runSchedule: (schedulePath: string, ...args: any[]) => Promise<void>;
  }
  export interface Application extends ScheduleApplication {}
}
