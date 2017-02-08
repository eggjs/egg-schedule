'use strict';

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments)).next());
  });
};

exports.schedule = {
  type: 'worker',
  cron: '*/5 * * * * *',
};

exports.task = function (ctx) {
  return __awaiter(this, void 0, void 0, function* () {
    ctx.logger.info(`method: ${ctx.method}, path: ${ctx.path}, query: ${JSON.stringify(ctx.query)}`);
    const msg = yield ctx.service.user.hello('busi');
    ctx.logger.info(msg);
  });
};
