import { debuglog } from 'node:util';
import type { ILifecycleBoot } from 'egg';
import { WorkerStrategy } from './lib/strategy/worker.js';
import { AllStrategy } from './lib/strategy/all.js';
import { EggScheduleJobInfo } from './lib/types.js';
import type Agent from './app/extend/agent.js';

const debug = debuglog('@eggjs/schedule/agent');

export default class Boot implements ILifecycleBoot {
  #agent: Agent;
  constructor(agent: Agent) {
    this.#agent = agent;
  }

  async configDidLoad(): Promise<void> {
    // register built-in strategy
    this.#agent.schedule.use('worker', WorkerStrategy);
    this.#agent.schedule.use('all', AllStrategy);

    // wait for other plugin to register custom strategy
    await this.#agent.schedule.init();

    // dispatch job finish event to strategy
    this.#agent.messenger.on('egg-schedule', (info: EggScheduleJobInfo) => {
      // get job info from worker
      this.#agent.schedule.onJobFinish(info);
    });
    debug('configDidLoad');
  }

  async serverDidReady(): Promise<void> {
    // start schedule after worker ready
    await this.#agent.schedule.start();
    debug('serverDidReady, schedule start');
  }

  async beforeClose(): Promise<void> {
    // stop schedule before app close
    await this.#agent.schedule.close();
    debug('beforeClose, schedule close');
  }
}
