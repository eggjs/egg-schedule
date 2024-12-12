export default () => {
  const config = {} as Record<string, any>;

  config.customLogger = {
    scheduleLogger: {
      consoleLevel: 'NONE',
      file: 'egg-schedule.log',
    },
  };

  config.schedule = {
    // custom additional directory, full path
    directory: [],
  };

  return config;
};
