'use strict';

module.exports = function() {
  exports.schedule = {
    type: 'worker',
    cron: '*/5 * * * * *',
  };

  exports.task = function* (ctx) {
    ctx.logger.info('cron');
  };

  return exports;
};
