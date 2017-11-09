'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  * hello(name) {
    return `hello ${name}`;
  }
}

module.exports = UserService;
