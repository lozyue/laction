/**
 * Control the Laction status.
 */
import { arbitraryFree, is_String, is_Array } from "../utils/utils";
import { KERNEL, ROOT, PRECEDENCE, NORMAL, DEBUG, INFOR } from '../utils/const';

export function InitController(Laction){
    /**
   * 启动消息队列方法
   * 默认重复调用排斥（不会执行多次）
   * @param {Boolean} instant 控制执行行为 默认状态和即刻生效状态
   * 调用一次run方法后， instant设置为true时再调用将立即执行Action，并将前移后续周期循环，period不变(允许多次调用不冲突)
   * 启动时设置`instant`则在启动时就会立即执行一次;
   */
  Laction.prototype.run = function (instant=false) {
    let driver, cancelDriver, Action;
    // 高级固定任务间隔循环
    if(this.$settings.fixedPeriod){
      driver = window.setTimeout;
      cancelDriver = window.clearTimeout;
      Action = ()=>{
        // console.log(this.currentOrbit);
        // 多轨道消息处理系统
        
        // 使用 for 循环为同步注入模式，currentOrbit总是会保留在值10，改为异步回调执行为佳
        /* for (this.currentOrbit = 0; this.currentOrbit < this.$settings.orbitNumber; this.currentOrbit++) {

          // 在不同间隔时间 取模调用对应轨道
          if (this.orbitCircle % (this.currentOrbit+1) === 0){

            DEBUG && console.log("this.orbitCircle , this.currentOrbit, this.messageOrbits[i]:", this.orbitCircle , this.currentOrbit, this.messageOrbits[this.currentOrbit]);
            // 考虑在这里加入一个轨道分时？？？
            console.log(this.currentOrbit)
            this.messageOrbits[this.currentOrbit] = this.everyAction(this.messageOrbits[this.currentOrbit] );
          }
        } */

        // 轨道 id 处理供回调
        if(this.currentOrbit++, this.currentOrbit<this.$settings.orbitNumber){

          if(this.orbitCircle % (this.currentOrbit+1) === 0){
            // this.messageOrbits[this.currentOrbit] = this.everyAction(this.messageOrbits[this.currentOrbit], Action);
            this.everyAction(this.messageOrbits[this.currentOrbit], ()=>{
              Action();
            });
          }else{
            Action();
          }
        // 一轮完成
        }else{
          this.currentOrbit = 0;
          // 循环控制部分作为回调
          if(this.$settings.periodHandle) this.$settings.periodHandle = window.setTimeout((_self)=>{
              Action(_self), _self.orbitCircle++;
          }, this.$settings.period, this); // 传递执行参数this
          return false;
        }
        
      };
    } else {
      driver = window.setInterval;
      cancelDriver = window.clearInterval;
      Action = () => {
        // 多轨道消息处理系统
        /* for (_self.currentOrbit=0; _self.currentOrbit < _self.$settings.orbitNumber; _self.currentOrbit++) {
          // 在不同间隔时间 取模调用对应轨道
          if (_self.orbitCircle % (_self.currentOrbit+1) === 0)
            _self.messageOrbits[_self.currentOrbit] = _self.everyAction(_self.messageOrbits[_self.currentOrbit] );
        } */

        // 异步处理
        if(this.currentOrbit++, this.currentOrbit<this.$settings.orbitNumber){
        }else{
          this.currentOrbit = 0;
          return false;
        }
        
        if(this.orbitCircle % (this.currentOrbit+1) === 0){
          // this.messageOrbits[this.currentOrbit] = this.everyAction(this.messageOrbits[this.currentOrbit], Action);
          this.everyAction(this.messageOrbits[this.currentOrbit], ()=>{
            Action();
          });
        }else{
          Action();
        }
        
      };
    }
    // 即刻模式
    if(instant){
      if(this.$settings.periodHandle) cancelDriver(this.$settings.periodHandle);

      Action(this); // 立即执行

      _self.orbitCircle++; // 循环次数，考虑整型上限需要重置？

      this.$settings.periodHandle = driver((_self)=>{
        Action(_self);

        _self.orbitCircle++; // 循环次数，考虑整型上限需要重置？
      }, this.$settings.period, this); // 继续后续周期
      return true;
    }
    // 未启动 则启动
    if(!this.$settings.periodHandle) this.$settings.periodHandle = driver((_self)=>{
      
      Action(_self); 
      
      _self.orbitCircle++;
    }, this.$settings.period, this);
  }

  /**
   * 终止后续周期的运行
   * @param {Boolean} instant  是否立即本周期
   **/
  Laction.prototype.stop = function (instant = true) {
    if(!this.$settings.fixedPeriod){
      window.clearInterval(this.$settings.periodHandle);
    }
    if(instant) clearTimeout(this.$settings.periodHandle);
    this.$settings.periodHandle = 0; // 终止符
  }
}