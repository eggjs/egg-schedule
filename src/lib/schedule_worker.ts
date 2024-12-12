import type { Application } from 'egg';
import { loadSchedule } from './load_schedule.js';
import type { ScheduleItem } from './types.js';

export class ScheduleWorker {
  #app: Application;
  scheduleItems: Record<string, ScheduleItem>;

  constructor(app: Application) {
    this.#app = app;
  }

  async init() {
    this.scheduleItems = await loadSchedule(this.#app);
  }

  registerSchedule(scheduleItem: ScheduleItem) {
    this.scheduleItems[scheduleItem.key] = scheduleItem;
  }

  unregisterSchedule(key: string) {
    delete this.scheduleItems[key];
  }
}
