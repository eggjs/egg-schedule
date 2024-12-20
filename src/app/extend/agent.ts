import { Agent as EggAgent } from 'egg';
import { BaseStrategy } from '../../lib/strategy/base.js';
import { TimerStrategy } from '../../lib/strategy/timer.js';
import { Schedule } from '../../lib/schedule.js';

const SCHEDULE = Symbol('agent schedule');

export default class Agent extends EggAgent {
  /**
   * @member agent#ScheduleStrategy
   */
  get ScheduleStrategy() {
    return BaseStrategy;
  }

  /**
   * @member agent#TimerScheduleStrategy
   */
  get TimerScheduleStrategy() {
    return TimerStrategy;
  }

  /**
   * @member agent#schedule
   */
  get schedule() {
    let schedule = this[SCHEDULE] as Schedule;
    if (!schedule) {
      this[SCHEDULE] = schedule = new Schedule(this);
    }
    return schedule;
  }
}
