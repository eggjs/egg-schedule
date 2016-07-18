'use strict';

exports.schedule = {
  type: 'worker',
  interval: 2500,
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
