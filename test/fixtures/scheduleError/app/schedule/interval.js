'use strict';

exports.schedule = {
  type: 'worker',
};

exports.task = async function (ctx) {
  ctx.logger.info('interval');
};
