'use strict';

exports.schedule = {
  type: 'all',
  cron: '*/5 * * * * *',
};

exports.task = function* (ctx) {
  ctx.logger.info('cron');
};
