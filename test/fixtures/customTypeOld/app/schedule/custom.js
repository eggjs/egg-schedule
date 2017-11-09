'use strict';

exports.schedule = {
  type: 'custom',
  interval: 4000,
};

exports.task = async function (ctx) {
  ctx.logger.info('custom_log');
};
