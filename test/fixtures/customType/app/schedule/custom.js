'use strict';

exports.schedule = {
  type: 'custom',
  interval: 2500,
};

exports.task = function* (ctx) {
  ctx.logger.info('custom');
};
