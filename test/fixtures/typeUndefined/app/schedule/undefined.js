'use strict';

exports.schedule = {
  type: 'undefined',
  interval: 2000,
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
