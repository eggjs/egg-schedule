'use strict';

const Strategy = require('./timer');

module.exports = class AllStrategy extends Strategy {
  async handler() {
    let canBeLocked = true;
    const curConfig = this.agent?.config?.schedule;
    let lockedKey = '';
    if (curConfig?.cluster?.enable) {
      lockedKey = this.key.replace(this.agent.baseDir, '');
      if (!(await this.agent.lockManager.tryAcquire(lockedKey))) {
        canBeLocked = false;
      }
    }

    if (canBeLocked) {
      this.sendAll();
    }

    if (curConfig?.cluster?.enable) {
      await this.agent.lockManager.release(lockedKey);
    }
  }
};
