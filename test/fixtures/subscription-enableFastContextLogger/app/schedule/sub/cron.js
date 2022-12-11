const Subscription = require('egg').Subscription;

class Interval extends Subscription {
  static get schedule() {
    return {
      type: 'worker',
      cron: '*/5 * * * * *',
    };
  }

  * subscribe() {
    this.app.logger.info('cron');
  }
}

module.exports = Interval;
