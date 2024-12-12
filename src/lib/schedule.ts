import type { Agent, EggLogger } from 'egg';
import { loadSchedule } from './load_schedule.js';
import type { ScheduleItem, ScheduleJobInfo } from './types.js';
import type { BaseStrategy } from './strategy/base.js';

export class Schedule {
  closed = false;

  #agent: Agent;
  #logger: EggLogger;
  #strategyClassMap = new Map<string, typeof BaseStrategy>();
  #strategyInstanceMap = new Map<string, BaseStrategy>();

  constructor(agent: Agent) {
    this.#agent = agent;
    this.#logger = agent.getLogger('scheduleLogger');
  }

  /**
   * register a custom Schedule Strategy
   * @param {String} type - strategy type
   * @param {Strategy} clz - Strategy class
   */
  use(type: string, clz: typeof BaseStrategy) {
    this.#strategyClassMap.set(type, clz);
  }

  /**
   * load all schedule jobs, then initialize and register speical strategy
   */
  async init() {
    const scheduleItems = await loadSchedule(this.#agent);
    for (const scheduleItem of Object.values(scheduleItems)) {
      this.registerSchedule(scheduleItem);
    }
  }

  registerSchedule(scheduleItem: ScheduleItem) {
    const { key, schedule } = scheduleItem;
    const type = schedule.type;
    if (schedule.disable) return;

    // find Strategy by type
    const Strategy = this.#strategyClassMap.get(type!);
    if (!Strategy) {
      const err = new Error(`schedule type [${type}] is not defined`);
      err.name = 'EggScheduleError';
      throw err;
    }

    // Initialize strategy and register
    const instance = new Strategy(schedule, this.#agent, key);
    this.#strategyInstanceMap.set(key, instance);
  }

  unregisterSchedule(key: string) {
    return this.#strategyInstanceMap.delete(key);
  }

  /**
   * job finish event handler
   *
   * @param {Object} info - { id, key, success, message, workerId }
   */
  onJobFinish(info: ScheduleJobInfo) {
    this.#logger.debug(`[Job#${info.id}] ${info.key} finish event received by agent from worker#${info.workerId}`);
    const instance = this.#strategyInstanceMap.get(info.key);
    /* istanbul ignore else */
    if (instance) {
      instance.onJobFinish(info);
    }
  }

  /**
   * start schedule
   */
  start() {
    this.closed = false;
    for (const instance of this.#strategyInstanceMap.values()) {
      instance.start();
    }
  }

  close() {
    this.closed = true;
    for (const instance of this.#strategyInstanceMap.values()) {
      instance.close();
    }
  }
}
