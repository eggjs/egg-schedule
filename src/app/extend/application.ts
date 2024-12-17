import { ScheduleWorker } from '../../lib/schedule_worker.js';

const SCHEDULE_WORKER = Symbol('application#scheduleWorker');

export default {
  /**
   * @member app#schedule
   */
  get scheduleWorker() {
    if (!this[SCHEDULE_WORKER]) {
      this[SCHEDULE_WORKER] = new ScheduleWorker(this);
    }
    return this[SCHEDULE_WORKER];
  },
} as any;

