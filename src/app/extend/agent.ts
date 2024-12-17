import { BaseStrategy } from '../../lib/strategy/base.js';
import { TimerStrategy } from '../../lib/strategy/timer.js';
import { Schedule } from '../../lib/schedule.js';

const SCHEDULE = Symbol('agent#schedule');

export default {
  /**
   * @member agent#ScheduleStrategy
   */
  ScheduleStrategy: BaseStrategy,

  /**
   * @member agent#TimerScheduleStrategy
   */
  TimerScheduleStrategy: TimerStrategy,

  /**
   * @member agent#schedule
   */
  get schedule() {
    if (!this[SCHEDULE]) {
      this[SCHEDULE] = new Schedule(this);
      this.lifecycle.registerBeforeClose(() => {
        return this[SCHEDULE].close();
      });
    }
    return this[SCHEDULE];
  },
} as any;
