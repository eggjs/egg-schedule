import { TimerStrategy } from './timer.js';

export class AllStrategy extends TimerStrategy {
  handler() {
    this.sendAll();
  }
}
