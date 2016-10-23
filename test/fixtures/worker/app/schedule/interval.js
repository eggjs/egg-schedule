'use strict';

exports.schedule = {
  type: 'worker',
  interval: 4000,
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
