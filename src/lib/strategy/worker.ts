import { TimerStrategy } from './timer.js';

export class WorkerStrategy extends TimerStrategy {
  handler() {
    this.sendOne();
  }
}
