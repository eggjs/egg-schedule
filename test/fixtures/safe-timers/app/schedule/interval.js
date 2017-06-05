'use strict';

exports.schedule = {
  type: 'worker',
  interval: 4321,
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
