'use strict';

exports.schedule = {
  type: 'worker',
  immediate: true,
  interval: 2500,
};

exports.task = function* (ctx) {
  ctx.logger.info('immediate-interval');
};
