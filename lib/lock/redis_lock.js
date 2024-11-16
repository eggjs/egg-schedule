'use strict';
const LockManager = require('./base');
const Redis = require('ioredis');

module.exports = class RedisLock extends LockManager {
  constructor(agent) {
    super(agent);
    this.client = new Redis(this.options);
  }

  /**
   * Acquire a lock with waiting time
   * @param {string} lockedKey - The key to be locked
   * @param {number} expiredTime - The duration in milliseconds for which the lock should be expired automatically
   */
  async acquire(
    lockedKey,
    expiredTime = this.agent.config.schedule.cluster.lockedTtl
  ) {
    // Try again during 5s when it's locked
    const start = Date.now();
    while (Date.now() - start < expiredTime) {
      if (await this.tryAcquire(lockedKey, expiredTime)) {
        return true;
      }
      // Set random sleep time to avoid lock conflicts, random between 0.1s and 1s
      const randomSleepTime = Math.random() * 900 + 100;
      await new Promise(resolve => setTimeout(resolve, randomSleepTime));
    }
    return false;
  }

  /**
   * Release a lock from lock manager
   * @param {string} lockedKey - The key to be unlocked   */
  async release(lockedKey) {
    try {
      lockedKey = `${this.prefixKey}-${lockedKey}`;
      await this.client.del(lockedKey);
    } catch (err) {
      this.logger.error(
        `[egg-schedule] ${this.key} release lock error: ${err.message}`
      );
    }
  }

  /**
   * Try to acquire immediately without waiting
   * @param {string} lockedKey
   * @param {number} expiredTime
   */
  async tryAcquire(
    lockedKey,
    expiredTime = this.agent.config.schedule.cluster.lockedTtl
  ) {
    try {
      lockedKey = `${this.prefixKey}-${lockedKey}`;
      if (await this.client.get(lockedKey)) {
        return false;
      }
      await this.client.set(lockedKey, true, 'PX', expiredTime);
      return true;
    } catch (err) {
      this.logger.error(
        `[egg-schedule] ${this.key} try acquire lock error: ${err.message}`
      );
      return false;
    }
  }
};
