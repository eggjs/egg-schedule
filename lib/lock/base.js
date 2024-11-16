'use strict';

module.exports = class LockManager {
  constructor(agent) {
    this.agent = agent;
    this.client = null;
    this.options = null;
    this.prefixKey = `${this.agent?.config?.schedule?.default === 'default' ? this.agent.name : this.agent?.config?.schedule?.default}-${this.agent?.config?.schedule?.prefix}`;
  }

  /**
   * Require a lock from lock manager
   *
   * @param {string} _lockedKey - The key to lock
   */
  async acquire() {
    // Implementation here
  }

  /**
   * Release a lock from lock manager
   *
   * @param {string} _lockedKey - The key to unlock
   */
  async release() {
    // Implementation here
  }

  /**
   * Try to acquire without waiting
   *
   * @param {string} _lockedKey - The key to try to lock
   */
  async tryAcquire() {
    // Use _lockedKey in the implementation
    // Implementation here
  }
};
