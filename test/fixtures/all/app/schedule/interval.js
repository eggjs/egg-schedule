'use strict';

exports.schedule = {
  type: 'all',
  interval: 4000,
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
