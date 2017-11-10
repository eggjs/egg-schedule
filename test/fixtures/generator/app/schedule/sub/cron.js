'use strict';

exports.schedule = {
  type: 'worker',
  cron: '*/5 * * * * *',
};

exports.task = function* (ctx) {
  ctx.logger.info(`method: ${ctx.method}, path: ${ctx.path}, query: ${JSON.stringify(ctx.query)}`);
  const msg = yield ctx.service.user.hello('busi');
  ctx.logger.info(msg);
};
