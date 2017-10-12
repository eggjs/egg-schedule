'use strict';

const Subscription = require('egg').BaseContextClass;

class Interval extends Subscription {
  static get schedule() {
    type: 'worker',
    cron: '*/5 * * * * *',
  }

  * subscribe() {
    this.ctx.logger.info('cron');
  }
}

module.exports = Interval;
