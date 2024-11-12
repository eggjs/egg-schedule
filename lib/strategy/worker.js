'use strict';

const Strategy = require('./timer');

module.exports = class WorkerStrategy extends Strategy {
  async handler() {
    let isLocked = false;
    const curConfig = this.agent?.config?.schedule;
    let lockedKey = '';
    if (curConfig?.cluster?.enable) {
      this.logger.info('cluster mode');
      const projectName =
        curConfig.default === 'default'
          ? this.agent.baseDir.split('/').pop()
          : curConfig.default;
      const prefix = curConfig.prefix;
      lockedKey = `${projectName}-${prefix}-${this.key.replace(
        this.agent.baseDir,
        ''
      )}`;
      if (await this.agent.redisClient.get(lockedKey)) {
        isLocked = true;
      }
      await this.agent.redisClient.set(lockedKey, true);
    }

    if (!isLocked) {
      this.sendOne();
    }

    if (curConfig.cluster.enable) {
      await this.agent.redisClient.del(lockedKey);
    }
  }
};
