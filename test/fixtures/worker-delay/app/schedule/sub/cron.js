'use strict';

const { sleep } = require('mz-modules');

exports.schedule = {
  type: 'worker',
  mode: 'delay',
  cron: '*/2 * * * * *',
};

exports.task = async function (ctx) {
  ctx.logger.info('cron');
  await sleep('2s');
};
