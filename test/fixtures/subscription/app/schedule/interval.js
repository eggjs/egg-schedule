'use strict';

const Subscription = require('egg').BaseContextClass;

class Interval extends Subscription {
  static get schedule() {
    type: 'worker',
    interval: 4000,
  }

  * subscribe() {
    this.ctx.logger.info('interval');
  }
}

module.exports = Interval;
