'use strict';

exports.schedule = {
  type: 'worker',
  cron: 'invalid instruction',
};

exports.task = function* (ctx) {
  ctx.logger.info('cron');
};
