'use strict';
import * as _CONST from '../utils/const.js';

export function addSnapshot(laction){
  laction.mixin(function(_self){
    // 注册快照拍摄钩子
    _self.registerHook({
      name: "_snapshot",
      level: _CONST.ROOT,
      once: true,
      preMsgLoop: false,
      postMsgLoop: true,
      actions: function(msgQueue, records, nums){
        console.log(`%c Laction Snapshot %c ${this.currentOrbit} %o ${nums} %o`, "color: white; background: #e9546b; padding:1px 0;border-radius:2px 0 0 2px", "box-shadow:1px 1px 1px #e9546b;", '→', records);
      },
    });
    // lactionIns.rootHookKeys.push("snapshot");
  });
  
  // 拍摄快照函数,传递需要拍摄快照的轨道ID, -1 则对所有轨道拍摄（查看console控制台输出）
  laction.prototype.snapshot = function (orbitID = -1) {
    if (orbitID >= 0)
      this.messageOrbits[orbitID].unshift("_snapshot");
    else
      this.messageOrbits.forEach((item, index, arr) => { arr[index].unshift("_snapshot") }); // 对所有轨道拍摄快照
  }
}
