'use strict';

const Strategy = require('./timer');
const path = require('path');

module.exports = class AllStrategy extends Strategy {
  async handler() {
    let canBeLocked = true;
    const curConfig = this.agent?.config?.schedule;
    let lockedKey = '';
    if (curConfig?.cluster?.enable) {
      lockedKey = path.relative(this.agent.baseDir, this.key);
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
