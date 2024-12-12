import type { Agent, EggLogger } from 'egg';
import type { ScheduleConfig, ScheduleJobInfo } from '../types.js';

export class BaseStrategy {
  protected agent: Agent;
  protected scheduleConfig: ScheduleConfig;
  protected key: string;
  protected logger: EggLogger;
  protected closed = false;
  count = 0;

  constructor(scheduleConfig: ScheduleConfig, agent: Agent, key: string) {
    this.agent = agent;
    this.key = key;
    this.scheduleConfig = scheduleConfig;
    this.logger = this.agent.getLogger('scheduleLogger');
  }

  start() {
    throw new TypeError(`[egg-schedule] ${this.key} strategy should override \`start()\` method`);
  }

  close() {
    this.closed = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onJobStart(_info: ScheduleJobInfo) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onJobFinish(_info: ScheduleJobInfo) {}

  /**
   * trigger one worker
   *
   * @param {...any} args - pass to job task
   */
  sendOne(...args: any[]) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.logger.warn(`${this.key} skip due to schedule closed`);
      return;
    }

    this.count++;

    const info = {
      key: this.key,
      id: this.getSeqId(),
      args,
    } as ScheduleJobInfo;

    this.logger.debug(`[Job#${info.id}] ${info.key} triggered, send random by agent`);
    this.agent.messenger.sendRandom('egg-schedule', info);
    this.onJobStart(info);
  }

  /**
   * trigger all worker
   *
   * @param {...any} args - pass to job task
   */
  sendAll(...args: any[]) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.logger.warn(`${this.key} skip due to schedule closed`);
      return;
    }

    this.count++;

    const info = {
      key: this.key,
      id: this.getSeqId(),
      args,
    } as ScheduleJobInfo;
    this.logger.debug(`[Job#${info.id}] ${info.key} triggered, send all by agent`);
    // send to all workers
    this.agent.messenger.send('egg-schedule', info);
    this.onJobStart(info);
  }

  getSeqId() {
    return `${Date.now()}${process.hrtime().join('')}${this.count}`;
  }
}
