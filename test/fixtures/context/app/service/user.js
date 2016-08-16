'use strict';

module.exports = app => {
  return class UserService extends app.Service {
    * hello(name) {
      return `hello ${name}`;
    }
  };
};
