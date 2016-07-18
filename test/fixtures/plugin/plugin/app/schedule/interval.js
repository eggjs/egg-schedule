'use strict';

exports.schedule = {
  type: 'worker',
  interval: 2000,
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
