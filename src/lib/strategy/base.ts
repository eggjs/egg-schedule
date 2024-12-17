import type { Agent, EggLogger } from 'egg';
import type { EggScheduleConfig, EggScheduleJobInfo } from '../types.js';

export class BaseStrategy {
  protected agent: Agent;
  protected scheduleConfig: EggScheduleConfig;
  protected key: string;
  protected logger: EggLogger;
  protected closed = false;
  count = 0;

  constructor(scheduleConfig: EggScheduleConfig, agent: Agent, key: string) {
    this.agent = agent;
    this.key = key;
    this.scheduleConfig = scheduleConfig;
    this.logger = this.agent.getLogger('scheduleLogger');
  }

  /** keep compatibility */
  get schedule(): EggScheduleConfig {
    return this.scheduleConfig;
  }

  start() {
    // empty loop by default
  }

  close() {
    this.closed = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onJobStart(_info: EggScheduleJobInfo) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onJobFinish(_info: EggScheduleJobInfo) {}

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
    } as EggScheduleJobInfo;

    this.logger.info(`[Job#${info.id}] ${info.key} triggered, send random by agent`);
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
    } as EggScheduleJobInfo;
    this.logger.info(`[Job#${info.id}] ${info.key} triggered, send all by agent`);
    // send to all workers
    this.agent.messenger.send('egg-schedule', info);
    this.onJobStart(info);
  }

  getSeqId() {
    return `${Date.now()}${process.hrtime().join('')}${this.count}`;
  }
}
