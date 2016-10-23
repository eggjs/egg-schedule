'use strict';

exports.schedule = {
  type: 'custom',
  interval: 4000,
};

exports.task = function* (ctx) {
  ctx.logger.info('custom');
};
