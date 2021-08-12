/**
 * lazy队列消息控制类
 * 目前基于定时器和time实现
 * Direction:
 * [使用消息队列] : register -> addAction -> run
 * [支持的消息类型] : 
 *   [String Message] 调用对应消息方法, 本周期执行，执行间隔小于周期时间
 *   [Array Message] String消息和其附带参数构成的参数消息
 *   [Function Message] 防抖消息，本周期不执行，下一周期执行.执行间隔大于周期时间
 */

import * as _CONST from "../utils/const.js";
import { shallowFilter } from "../utils/utils.js";

export function LactionInit(Laction){ 
  Laction.DEBUG = true; // the options manager all the instances for global user debug status.

  Laction.prototype.parseOptions = function(options){
    
  }
  Laction.prototype._init = function ({...options}) {
    const self = this;
    const SETTINGS = {
      periodHandle: 0, //  计时器句柄 0为启动函数run标识
    };
    Object.freeze(SETTINGS); // 改为只读常量
    const optional = {
      period: 500, // 单位ms
      orbitNumber: 10, // 总共的消息轨道数,以period递增 ID 为0-9
      fixedPeriod: true, // 是否用固定时间间隔执行(启用高级计时器:setTimeout循环), 否则不考虑执行时间直接定时执行(setInterval)
      debug: false,
    }
    // Object.assign(optional, options);

    // 初始化方法，用于构建底层消息
    this.init = function () {
      this.orbitCircle = 0; // 轨道消息计数器，通过运算决定执行不同的消息轨道
      this.currentPeriod = 0; // 当前真正执行的消息轨道

      this.hooks = {}; // 钩子对象，一个钩子对应一个消息，一个消息对应多个消息方法，但是消息方法未分开存储
      this.actions = []; // 动作对象，每个周期均会执行的方法

      if(Array.fill)
        this.messageOrbits = new Array(this.$settings.orbitNumber).fill(null).map( ()=>[] );
      else{
        this.messageOrbits = new Array(this.$settings.orbitNumber);
        for (let i = 0; i < self.messageOrbits.length; i++) self.messageOrbits[i] = []; // 兼容ES6以下方法
      }

      /* // 计数器orbitCircle重置, 放入尾部消息队列进行 消息循环
      let reset = function () {
        _CONST.INFOR && _CONST.DEBUG && console.log("[Laction]: orbit couter reseted!");
        self.orbitCircle = 0; // 重置计数器
        return reset; // 继续进行消息循环
      }
      self.messageOrbits[self.$settings.orbitNumber - 1].push(reset); */
    };
    // 进行默认选项设置
    this.$settings = Object.assign(optional, SETTINGS); // Mixin the fundamental options 混合基本选项
    this.init();
    // The plugins will provide some more mixed options.
    this._pluginInit(options); // 插件管理支持
    this._mixinInit(); // 混入API生效
    // Re-mixin. The user options is higher than plugins options. 重新混合备份选项
    this.$settings = Object.assign(this.$settings, options, SETTINGS);
    this.check(); 
  };

  Laction.prototype.check = function(){
    if(this.$settings.period < 50){
      console.warn("Laction: the minimum period is recommended for less than 50ms, Otherwise there will be low performance.");
    }
    this.$settings.fixedPeriod = ~~this.$settings.fixedPeriod;
    if(!this.$settings.fixedPeriod) this.$settings.fixedPeriod = 1;
  }
  
  // 返回创建的轨道数量，同 options.orbitNumber 相等
  Laction.prototype.getOrbitNumber = function(){return this.messageOrbits.length};

  /**
   * 队列中的消息的废除消息方法(过滤)
   * 可指定轨道，自定义规则，[快速]限制指定的消息类型，可传递多种类型
   * @param {orbit} 指定消息轨道上的消息进行清除
   * @param {Function} rule
   * @param {Prototype Object} types // 可传递多个参数，指定规定原型内的消息进行删除
   */
  Laction.prototype.revoke = function(orbit = -1, rule=(msg)=>(!msg), ...types){
    // 清除指定轨道
    if(orbit>-1){
      if(types.length===0) types = [String, Array];
      this.messageOrbits[orbit] = this.messageOrbits[orbit].filter((msg)=>{
        return rule(msg) && type.indexOf(msg.constructor)>-1;
      });
    }
  }

  // 周期，消息处理系统
  // Only handle one orbit at a time.
  Laction.prototype.everyAction = function (queueIndex, next) {
    
    const messageQueue = this.messageOrbits[queueIndex];
    // 初始化清空
    this.eventsRecorder.reset();
    // 处理消息队列
    let exeTimes = 0,
        index,
        // snapshot = false // 消息快照
        postMsgLoopActions = []
        ;

    // Filter the pre & post loop hooks.
    shallowFilter(messageQueue, hook=>{
      // 判断条件 钩子存在 钩子级别_CONST.ROOT或以上 是预循环钩子或者后置循环钩子的一种
      let result = this.hooks[hook] && this.hooks[hook].level <= _CONST.ROOT && (this.hooks[hook].preMsgLoop || this.hooks[hook].postMsgLoop);
      if(result){
        this.hooks[hook].actions.forEach(action=>{
          // 后置循环钩子动作先存储起来
          if( this.hooks[hook].postMsgLoop ){
            postMsgLoopActions.push(action);
          }else{
            // invoke pre loop hooks
            action.call(this, messageQueue, this.eventsRecorder.getRecords() ); // invoke with nature `this` dominant
          }
        });
      }
      return !result; // filter the corresponding hooks.
    });

    exeTimes = messageQueue.length; // Catch the length of messageQueue before it maybe change. 
    // mian loop
    for (index = 0; index < exeTimes; index++) {
      let currentMsg = messageQueue.shift(),
        hookArguments = [],
        debounceMode = false; // Debounce check.
      
      if( !currentMsg ) continue; // 空消息执行下一循环
 
      // _CONST.DEBUG && console.log("Ahead of the message handling:", currentMsg);

      // Function type message. for Debonce. Get the message by return value of the function.
      if (currentMsg.constructor === Function) {
        // Invoke without arguments to keep some sort of security And get the return value. Excepted String.
        currentMsg = currentMsg();
        debounceMode = true;
      }
      // Array type message with executive params. Support 'function array' type.
      if (currentMsg.constructor === Array) {
        let realMsg = currentMsg.shift();
        hookArguments = currentMsg;
        currentMsg = realMsg;
      }

      // _CONST.DEBUG && console.log("After handled the Message:", currentMsg);

      let currentHook = this.hooks[currentMsg];

      // 存在检测
      if ( (debounceMode || currentHook) ) {
        // _CONST.DEBUG && console.log(`[Orbit msg index${index}] is:`, currentMsg, messageQueue);
        try {
          this.eventsRecorder.recordEvents(currentMsg); // 记录事件
          // 防抖消息
          if (debounceMode){
            messageQueue.push(hookArguments.length? (hookArguments.unshift(currentMsg), hookArguments): currentMsg); // 后置值下一轮进行执行
            continue;
          }
          // period throttle.
          if (currentHook.once && this.eventsRecorder.isHappened(currentMsg) ){

            _CONST.DEBUG && console.log("Current throttled message and the throttle counts:", this.eventsRecorder.getRecords(currentMsg), currentHook);
            
            // period debounce only go into effect on `once` options setted, namely set the period throttle on.
            if(currentHook.debounce){
              // set debounce
              if(this.eventsRecorder.isTwice(currentMsg)){
                this.lactionLog(`[Laction]: Debouce the msg ${currentMsg}`);
                // messageQueue.push(this.decorator(currentMsg, true) );
                messageQueue.push( currentMsg );
              }
            }
            continue;
          }
          
          // 普通消息执行对应钩子 并保持其作用域
          if(currentHook.level > _CONST.ROOT){
            this.lactionLog(`[Laction]: Handled normal msg ${currentMsg} with args:${arguments},debounce:${debounceMode}`);

            currentHook.actions.forEach(element => {
              element(...hookArguments); // invoke with formal `this` dominant
            });
          // ROOT级及以上 this 作用域为实例对象, 并可根据返回值执行 break, continue, 修改循环控制变量 等指令
          }else{
            this.lactionLog(`[Laction]: Root msg ${currentMsg}:`);
            // // 放置过程变量到核心方法的参数列表末尾中 即 everyAction 方法的两个参数
            // hookArguments.push(messageQueue);
            currentHook.actions.forEach(element => {
              let indicator = element.apply(this, hookArguments);
              if(!isNaN(indicator)) exeTimes = indicator; // 修改循环控制条件 可通过 return 0 来终止下次循环达到break的效果
            });
          }
        } catch (e) {
          console.error(`[Laction] Message "${currentMsg}" hooks Aborted `, e);
        }
      }
      else {
        // Unknow type or the message hook is not registered.
        this.lactionWarn(`[Laction]: Can not dispose message`, currentMsg, ` which type is:${typeof currentMsg} & ${currentMsg.constructor}`);
      }
    }
    // post hook loop
    postMsgLoopActions.forEach(action=>{
      action.call(this, messageQueue, this.eventsRecorder.getRecords(), index);
    });
    // next loop;
    next && next();
  }

  /**
   * Log the Debug msg when the debug settings is on (true).
   * @param {any} param 
   */
  Laction.prototype.lactionLog = function(...param){
    Laction.DEBUG && this.$settings.debug && console.log(...param);
  }
  Laction.prototype.lactionWarn = function(...param){
    Laction.DEBUG && this.$settings.debug && console.warn(...param);
  }
  Laction.prototype.lactionError = function(...param){
    Laction.DEBUG && this.$settings.debug && console.error(...param);
  }
};

