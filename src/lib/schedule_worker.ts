import { loadSchedule } from './load_schedule.js';
import type { EggScheduleItem } from './types.js';
import type Application from '../app/extend/application.js';

export class ScheduleWorker {
  #app: Application;
  scheduleItems: Record<string, EggScheduleItem> = {};

  constructor(app: Application) {
    this.#app = app;
  }

  async init() {
    this.scheduleItems = await loadSchedule(this.#app);
  }

  registerSchedule(scheduleItem: EggScheduleItem) {
    this.scheduleItems[scheduleItem.key] = scheduleItem;
  }

  unregisterSchedule(key: string) {
    delete this.scheduleItems[key];
  }
}
