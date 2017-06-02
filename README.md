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

A schedule plugin for egg. It supports two scheduler types, `worker` and `all`, and can be extended by other plugins.

## Installation

```bash
$ npm i egg-schedule --save
```

## Usage

`egg-schedule` is a plugin that has been built-in for egg. It is enabled by default.

```javascript
// {app_root}/config/plugin.js
exports.schedule = {
  package: 'egg-schedule',
};

// {app_root}/app/schedule/cleandb.js
/**
* @property {Object} schedule
*  - {String} type - schedule type, `worker` or `all`
*  - {String} [cron] - cron expression, [see below](#cron-style-scheduling)
*  - {String | Number} [interval] - interval expression in millisecond or express explicitly like '1h'. [see below](#interval-style-scheduling)
*  - {Boolean} [immediate] - To run a scheduler at startup
*  - {Boolean} [disable] - whether to disable a scheduler, usually use in dynamic schedule
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

`egg-schedule` supports both time-based scheduling and interval-based scheduling.

Schedule decision is being made by `agent` process. `agent` triggers a task and sends message to `worker` process. Then, one or all `worker` process(es) execute the task based on schedule type.

To setup a schedule task, simply create a job file in `{app_root}/app/schedule`. A file contains one job and export `schedule` and `task` properties.

The rule of thumbs is one job per file.

## Task

Task is a generator function, and accept one parameter, `ctx`. The syntax is, `exports.task = function* (ctx) { ... };`

When the scheduled task runs, the scheduled job information will be logged and written to a local file in a folder called `/logs`. The log file contains many useful information, for example,

- ctx.method: `SCHEDULE`
- ctx.path: `/__schedule/${schedulePath}`. example path: `/__schedule?path=/FULL_PATH_TO/cleandb.js&type=worker&interval=3h`
- ctx.query: `scheule config(type=worker&cron=*%2F5%20*%20*%20*%20*%20*)`


To create a task, it is as simple as write a generator function. For example:

```javascript
// A simple logger example
exports.task = function* (ctx) {
  ctx.logger.info('Info about your task');
};
```

```javascript
// A real world example: wipe out your database.
// Use it with caution. :)
exports.task = function* (ctx) {
  yield ctx.service.db.cleandb();
};
```

## Scheduling

`schedule` is an object that contains one required property, `type`, four optional properties, `{ cron, interval, immediate, disable }`.

### Cron-style Scheduling

Use [cron-parser](https://github.com/harrisiirak/cron-parser).

> Note: `cron-parser` support `second` as optional that is not supported by linux crontab.
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

Example:

```javascript
// To execute task every 3 hours
exports.schedule = {
  type: 'worker',
  cron: '0 0 */3 * * *',
};
```

### Interval-style Scheduling

To use `setInterval`, and support [ms](https://www.npmjs.com/package/ms) conversion style

Example:

```javascript
// To execute task every 3 hours
exports.schedule = {
  type: 'worker',
  interval: '3h',
};
```

### Schedule Type

**Build-in support is:**

  - **worker**: will be executed in one random worker when schedule run.
  - **all**: will be executed in all workers when schedule run.

**Custom schedule**

To create a custom schedule, simply create a schedule with a type `custom` and its corresponding method. Inside your custom method, you can schedule the task to be executed by one random worker or all workers with the built-in method `sender.one()` or `sender.all()`.

```javascript
// {app_root}/agent.js
const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');

module.exports = agent => {
  // sender.one() - will notify one random worker to execute task
  // sender.all() - will notify all workers
  agent[SCHEDULE_HANDLER].custom = (schedule, sender) =>
    setInterval(sender.one, schedule.interval);
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
    // only start task when hostname match
    disable: require('os').hostname() !== app.config.sync.hostname
  };

  exports.task = function* (ctx) {
    yield ctx.sync();
  };

  return exports;
};
```

## Testing

`app.runSchedule(scheduleName)` is provided by `egg-schedule` plugin only for test purpose.

Example:

```javascript
it('test a schedule task', function* () {
  // get app instance
  yield app.runSchedule('clean_cache');
});
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](https://github.com/eggjs/egg-schedule/blob/master/LICENSE)

