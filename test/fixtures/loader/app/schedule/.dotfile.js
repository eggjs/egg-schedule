'use strict';

exports.schedule = {
  type: 'worker',
  immediate: true,
  cron: '*/5 * * * * *',
};

exports.task = function* (ctx) {
  ctx.logger.info('dotfile');
};
