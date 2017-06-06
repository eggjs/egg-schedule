'use strict';

const loadSchedule = require('./lib/load_schedule');
const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');
const SCHEDULE_HANDLER = Symbol.for('egg#scheduleHandler');

module.exports = agent => {
  // add handler into `agent[SCHEDULE_HANDLER]` for extend other kind of schedule type.
  // worker: will excute in one random worker when schedule excuted.
  // all: will excute in all workers when schedule excuted.
  const handlers = agent[SCHEDULE_HANDLER] = {
    worker: workerHandler,
    all: allHander,
  };

  agent.messenger.once('egg-ready', startSchedule);

  function startSchedule() {
    agent.disableSchedule = false;
    const schedules = loadSchedule(agent);
    for (const s in schedules) {
      const schedule = schedules[s];
      if (schedule.schedule.disable) continue;

      const type = schedule.schedule.type;
      const handler = handlers[type];
      if (!handler) {
        const err = new Error(`schedule type [${type}] is not defined`);
        err.name = 'EggScheduleError';
        throw err;
      }
      handler(schedule.schedule, {
        one() {
          sendMessage(agent, 'sendRandom', schedule.key);
        },
        all() {
          sendMessage(agent, 'send', schedule.key);
        },
      });
    }
  }

  agent.on('close', () => {
    agent.disableSchedule = true;
    return;
  });
};

function sendMessage(agent, method, key) {
  if (agent.disableSchedule) {
    agent.coreLogger.info(`[egg-schedule] message ${key} did not sent`);
    return;
  }
  agent.coreLogger.info(`[egg-schedule] send message: ${method} ${key}`);
  agent.messenger[method](key);
}

function workerHandler(schedule, sender) {
  baseHander(schedule, sender.one);
}

function allHander(schedule, sender) {
  baseHander(schedule, sender.all);
}

function baseHander(schedule, send) {
  if (!schedule.interval && !schedule.cron) {
    throw new Error('[egg-schedule] schedule.interval or schedule.cron must be present');
  }

  if (schedule.interval) {
    const interval = ms(schedule.interval);
    safeInterval(send, interval);
  }

  if (schedule.cron) {
    let interval;
    try {
      interval = parser.parseExpression(schedule.cron);
    } catch (err) {
      err.message = `[egg-schedule] parse cron instruction(${schedule.cron}) error: ${err.message}`;
      throw err;
    }
    startCron(interval, send);
  }

  if (schedule.immediate) {
    setImmediate(send);
  }
}

function startCron(interval, listener) {
  const now = Date.now();
  let nextTick;
  do {
    nextTick = interval.next().getTime();
  } while (now >= nextTick);

  safeTimeout(() => {
    listener();
    startCron(interval, listener);
  }, nextTick - now);
}

function safeTimeout(fn, delay, ...args) {
  if (delay < safetimers.maxInterval) {
    setTimeout(fn, delay, ...args);
  } else {
    safetimers.setTimeout(fn, delay, ...args);
  }
}

function safeInterval(fn, delay, ...args) {
  if (delay < safetimers.maxInterval) {
    setInterval(fn, delay, ...args);
  } else {
    safetimers.setInterval(fn, delay, ...args);
  }
}
