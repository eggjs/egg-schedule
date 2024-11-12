'use strict';

module.exports = () => {
  const config = {};

  config.customLogger = {
    scheduleLogger: {
      consoleLevel: 'NONE',
      file: 'egg-schedule.log',
    },
  };

  config.schedule = {
    // custom additional directory, full path
    directory: [],
    cluster: {
      enable: false,
      redis: {
        client: {
          port: 6379, // Redis port
          host: '127.0.0.1', // Redis host
          password: 'auth',
          db: 0,
        },
      },
    },
    default: 'default',
    prefix: 'schedule',
  };

  return config;
};
