export const schedule = {
  type: 'worker',
  immediate: true,
  cron: '*/5 * * * * *',
};

export function *task(ctx) {
  ctx.logger.info('tsfile');
};
