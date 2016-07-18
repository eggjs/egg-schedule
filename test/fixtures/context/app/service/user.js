'use strict';

const egg = require('egg');

class UserService extends egg.Service {
  * hello(name) {
    return `hello ${name}`;
  }
}

module.exports = UserService;
