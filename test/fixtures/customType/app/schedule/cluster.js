'use strict';

exports.schedule = {
  type: 'cluster',
  interval: 4000,
};

exports.task = function* (ctx) {
  ctx.logger.info('cluster_log');
};
