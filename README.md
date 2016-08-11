# egg-schedule

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-schedule.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-schedule
[travis-image]: https://img.shields.io/travis/eggjs/egg-schedule.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-schedule
[codecov-image]: https://codecov.io/github/eggjs/egg-schedule/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-schedule?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-schedule.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-schedule
[snyk-image]: https://snyk.io/test/npm/egg-schedule/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-schedule
[download-image]: https://img.shields.io/npm/dm/egg-schedule.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-schedule

Schedule plugin for egg, support `worker` / `all` schedule type, and can extends by other plugins.

## Install

```bash
$ npm i egg-schedule --save
```

## Usage

`egg-schedule` is egg build-in plugin, so you don't need to enable it manually.

```javascript
// {app_root}/config/plugin.js
exports.view = {
  package: 'egg-schedule',
};

// {app_root}/app/schedule/cleandb.js
/**
* @property {Object} schedule
*  - {String} type - schedule type, build-in support is `worker/all`
*  - {String} [cron] - cron expression, see below
*  - {String/Number} [interval] - interval expression, support ms style, see below
*  - {Boolean} [immediate] - whether run at start
*  - {Boolean} [disable] - whether to disable schedule, usually use at dynamic schedule
*/
exports.schedule = {
  type: 'worker',
  cron: '0 0 3 * * *',
  // interval: '1h',
  // immediate: true,
};

exports.task = function* (ctx) {
  yield ctx.service.db.cleandb();
};
```

## Overview

`egg-schedule` is for time-based scheduling, not interval-based scheduling.  

Just put your jobs at `{app_root}/app/schedule`, one file as one job.  

Job file should export `schedule` and `task` properties.

## Task
Task should be a generator function, and accept ctx as params.

You can find schedule log at log file, which act like worker request, and contain:
- ctx.method: `SCHEDULE`
- ctx.path: `/__schedules/${schedulePath}`
- ctx.query: `scheule config(type=worker&cron=*%2F5%20*%20*%20*%20*%20*)`

example:
```javascript
exports.task = function* (ctx) {
  yield ctx.service.db.cleandb();
};
```

## Scheduling
`schedule` property is an object which contain `{ type, cron, interval, immediate }`.

### Cron-style Scheduling

Use [cron-parser](https://github.com/harrisiirak/cron-parser).

> Notify: `cron-parser` support `second` as optional which is not supported by linux crontab.
> 
> `@hourly / @daily / @weekly / @monthly / @yearly` is also supported.

```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```

example:
```javascript
// exce task every 3 hours
exports.schedule = {
  type: 'worker',
  cron: '0 0 */3 * * *',
};
```

### Interval-style Scheduling

Use `setInterval`, and support [ms](https://www.npmjs.com/package/ms) conversion style

example:
```javascript
// exce task every 3 hours
exports.schedule = {
  type: 'worker',
  interval: '3h',
};
```

### Schedule Type
Build-in support is:
  - worker: will execute in one random worker when schedule executed.
  - all: will execute in all workers when schedule executed.

You can extend it by: 

```javascript
// {app_root}/agent.js
const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');

module.exports = agent => {
  agent[SCHEDULE_HANDLER].custom = (schedule, sender) => {
    // sender.one() - will notify one random worker to execute task
    // sender.all() - will notify all workers
    setInterval(sender.one, schedule.interval);
  };
};

// {app_root}/app/schedule/other.js
exports.schedule = {
  type: 'custom',
};
```

## Dynamic schedule

```javascript
// {app_root}/app/schedule/sync.js
module.exports = app => {
  exports.schedule = {
    interval: 10000,
    type: 'worker',
    disable: require('os').hostname() !== app.config.sync.hostname, // only start task when hostname match
  };

  exports.task = function* (ctx) {
    yield ctx.sync();
  };

  return exports;
};
```

## Testing

`app.runSchedule(scheduleName)` is provided for easy testing, have fun.

example:
```javascript
it('test schedule task', function* () {
  // get app instance
  yield app.runSchedule('clean_cache');  
});
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
