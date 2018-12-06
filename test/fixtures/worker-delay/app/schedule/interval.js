'use strict';

const { sleep } = require('mz-modules');

exports.schedule = {
  type: 'worker',
  mode: 'delay',
  interval: 2000,
};

exports.task = async function (ctx) {
  ctx.logger.info('interval');
  await sleep('2s');
};
