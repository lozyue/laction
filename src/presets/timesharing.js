/***
 * 为 Laction 实例添加一个内置消息
 * tabs
 * 可分割当前任务，并将后续任务延后 一定ms数（默认50ms）
 */
import { DEBUG } from '../utils/const';
import * as _CONST from '../utils/const.ts';

export function addTimeSharing(Laction){
  Laction.mixin(function(_self){
    _self.registerHook({
      name: "_tabs",
      level: _CONST.KERNEL,
      once: true,
      preMsgLoop: false,
      postMsgLoop: false,
      actions: function(timeGap = 50){
        // 异步分时执行
        setTimeout((messageOrbit)=>{
          DEBUG && console.log("timeshared! ", _self, timeGap)
          _self.everyAction.call(_self, messageOrbit, null);
        }, timeGap, _self.messageOrbits[_self.counter]);
        return 0; // 终止当前消息循环
      },
    });
  });
  // Export the timeShare method.
  Laction.prototype.timeShare = function(orbitID = -1){
    if(orbitID<0) orbitID += this.getOrbitNumber();
    this.bubble("_tabs", orbitID, false);
  }
}
