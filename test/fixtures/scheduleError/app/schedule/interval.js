'use strict';

exports.schedule = {
  type: 'worker',
};

exports.task = function* (ctx) {
  ctx.logger.info('interval');
};
