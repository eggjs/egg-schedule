'use strict';

exports.schedule = {
  type: 'all',
  interval: 2500,
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
