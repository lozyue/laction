/**
 * Control the Laction operation.
 * Methods:
 *  Run()
 *  isRunning()
 *  stop()
 */

import { arbitraryFree, is_String, is_Array } from "../utils/utils";
import { KERNEL, ROOT, PRECEDENCE, NORMAL, DEBUG, INFOR } from '../utils/const';


export function InitController(Laction){
  /**
   * 启动消息队列方法
   * 默认重复调用排斥（不会执行多次）
   * @param {Boolean} instant 控制执行行为 默认状态和即刻生效状态
   * 调用一次run方法后， instant设置为true时再调用将立即执行Action，并将前移后续循环周期，period不变(允许多次调用不冲突)
   * 启动时设置`instant`则在启动时就会立即执行一次;
   */
  Laction.prototype.run = function (instant=false) {
    let driver, 
        cancelDriver, 
        Action,
        period = this.$settings.period,
        orbitNums = this.getOrbitNumber(), // get the number of orbits
        calculator = getOrbitComputer(); // get the closure function.

    // Advanced more fixed period task execution.
    if(this.$settings.fixedPeriod){
      driver = window.setTimeout;
      cancelDriver = window.clearTimeout;
      // The task to be driven.
      Action = (_self)=>{  
        // reset the period counter.
        if( orbitNums <= _self.currentPeriod){
          _self.currentPeriod = 0;
        }
        // Calculate to handle the target orbits on a period.
        calculator(_self);
        // couter increment.
        _self.currentPeriod++ ;
        // continue to drive.
        _self.$settings.periodHandle = driver(Action, _self.$settings.period, _self);
      };
    // setInterval mode. More simplified.
    } else {
      driver = window.setInterval;
      cancelDriver = window.clearInterval;
      // The task to be driven.
      Action = (_self) => {
        // reset the period counter.
        if( orbitNums <= _self.currentPeriod){
          _self.currentPeriod = 0;
        }
        // Calculate to handle the target orbits on a period.
        calculator(_self);
        // couter increment for next period.
        _self.currentPeriod++ ;
      };
    }

    // start the period driver.
    const start = (_self)=>{
      _self.$settings.periodHandle = driver((_self)=>{
        Action(_self);
      }, period, _self);
    }
    
    // Instant mode (即刻模式)
    if(instant){
      if(this.$settings.periodHandle) cancelDriver(this.$settings.periodHandle);
      // invoke instantly.
      Action(this); 
      // set the period driver.
      start(this);  
    }

    // Start if it is not running.
    if(!this.$settings.periodHandle){
      // set the period driver.
      start(this);
    };
  }

  Laction.prototype.isRunning = function(){
    return !!this.$settings.periodHandle;
  }

  /**
   * 终止运行(默认后续周期)
   * @param {Boolean} instant  是否立即终止本周期
   **/
  Laction.prototype.stop = function (instant = true) {
    if(!this.$settings.fixedPeriod){
      window.clearInterval(this.$settings.periodHandle);
    }
    if(instant) clearTimeout(this.$settings.periodHandle);
    this.$settings.periodHandle = 0; // 终止符
  }
}

function getOrbitComputer(){
  let orbitCircle = 10;
  // Calculate to handle the target orbits on a period.
  let periodCalc = (_self)=>{
    if((_self.currentPeriod+1)% orbitCircle === 0){
      // DEBUG && console.log(`The execute orbit ID：${orbitCircle-1}; currentPeriod：${_self.currentPeriod}`);
      _self.everyAction(orbitCircle - 1);
    }
    // decrease the orbit Circles
    orbitCircle--;
    // weather this period calculation is completed.
    if(!orbitCircle) 
      orbitCircle = 10;
    else 
      periodCalc(_self);
  };

  return periodCalc;
}
