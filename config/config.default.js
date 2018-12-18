'use strict';

const path = require('path');

module.exports = appInfo => {
  const config = {};

  config.customLogger = {
    scheduleLogger: {
      consoleLevel: 'NONE',
      file: path.join(appInfo.root, 'logs', appInfo.name, 'egg-schedule.log'),
    },
  };

  config.schedule = {
    // custom additional directory, full path
    directory: [],
  };

  return config;
};
