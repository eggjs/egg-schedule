'use strict';

exports.schedule = {
  type: 'all',
  mode: 'delay',
  interval: 4000,
};

exports.task = async function (ctx) {
  ctx.logger.info('interval');
};
