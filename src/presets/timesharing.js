/***
 * 为 Laction 实例添加一个内置消息
 * tabs
 * 可分割当前任务，并将后续任务延后 一定ms数（默认50ms）
 */
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
          console.log("timeshared! ",_self,timeGap)
          _self.everyAction.call(_self, messageOrbit, null);
        }, timeGap, _self.messageOrbits[_self.counter]);
        return 0; // 终止当前消息循环
      },
    });
  });
  // 注册方法
  Laction.prototype.timeShare = function(orbitID = -1){
    // 支持负引索，如 -1 表示 最后一条轨道
    if(orbitID<0) orbitID += this.$settings.orbitNumber;
    // console.log(this.counter, orbitID||this.counter); // 好像在调用bubble函数时总是在for循环末尾的，这样每次都是一轮执行完毕period变成10后才执行，然后报错
    this.bubble("_tabs",false, orbitID);
  }
}
