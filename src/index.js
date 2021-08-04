// core
import { LactionInit } from "./core/laction";
import { InitMixin } from "./core/mixin";
import { InitUse } from "./core/lactionUse";
import { InitManager } from './core/manager';
import { InitMessage } from './core/message';
import { InitRecorder } from './core/recorder';
import { InitController } from './core/controller';

// extend modules
import { initGrandInterval } from './extends/grandInterval';
import { initAlias } from './extends/alias';
// plugins
import { addTimeSharing } from './presets/timesharing.js';
import { addSnapshot } from './presets/snapshot.js';

/**
 * The Laction JS(lactionQueue JS) entry file
 */
function Laction(options){
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Laction) ) {
    warn('Laction is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

/**
 * 初始化 lactionQueue 组件
 **/

// init core
LactionInit(Laction);
InitMixin(Laction);
InitUse(Laction);

InitManager(Laction);
InitMessage(Laction);
InitRecorder(Laction);
InitController(Laction);

initAlias(Laction);
initGrandInterval(Laction);

// 混入和核心部分
addTimeSharing(Laction);
addSnapshot(Laction);


export default Laction;
