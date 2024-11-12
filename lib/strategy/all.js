'use strict';

const Strategy = require('./timer');
const path = require('path');

module.exports = class AllStrategy extends Strategy {
  async handler() {
    let isLocked = false;
    const curConfig = this.agent.config.schedule;
    let lockedKey = '';
    if (curConfig?.cluster?.enable) {
      this.logger.info('cluster mode');
      const projectName =
        curConfig.default === "default"
          ? path.basename(this.agent.baseDir)
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
      this.sendAll();
    }

    if (curConfig.cluster?.enable) {
      await this.agent.redisClient.del(lockedKey);
    }
  }
};
