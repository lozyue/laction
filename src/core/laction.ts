/**
 * Laction core.
 */

import * as _CONST from "../utils/const";
import { deepSupplement, LCMtoN, shallowFilter } from "../utils/utils";
import { MaxOrbitsLen, MinOribtsLen } from '../utils/const';

type Options = {
  period: number, // ms.
  orbitNumber: number, // The orbits lenth. Orbit index is start from 0.
  fixedPeriod: Boolean, // Whether use setTimeout to monitor setInterval.
  debug: Boolean, // Turn on current instance debug logs.
}

export function LactionInit(Laction) {
  const Proto = Laction.prototype;
  Laction.DEBUG = true; // the options manager all the instances for global user debug status.

  Proto.parseOptions = function(options: Options){
    const Optional = {
      period: 500,
      orbitNumber: 10,
      fixedPeriod: true,
      debug: false,
    }
    this.$settings = deepSupplement(options, Optional);
    
    // The handle of the Timer. 0 is the token for method `run`.
    this.periodHandle= 0;
    // The current period count of the instance from 0 to orbits length.
    this.counter = 0;
    // The max period counter
    this.MaxPeriodCounter = LCMtoN(options.orbitNumber);

    // Hook gathers.
    this.hooks = {};
    // Period actions.
    this.actions = [];
    // Create message orbits.
    if(Array()["fill"])
      this.messageOrbits = new Array(this.$settings.orbitNumber).fill(null).map( ()=>[] );
    else{
      this.messageOrbits = new Array(this.$settings.orbitNumber);
      for (let i = 0; i < this.messageOrbits.length; i++) this.messageOrbits[i] = []; // For compatibility.
    }
  }
  Proto._init = function (options) {
    this.check(options);
    this.parseOptions(options);
    // The plugins may provide some more mixed options.
    this._pluginInit(options); // Plugin support
    this._mixinInit(); // Imbed the Mixins.
  };

  Proto.check = function(options){
    if(options.period < 50){
      this.lactionWarn("the minimum period is recommended for less than 50ms, Otherwise there will be low performance.");
    }
    if(options.orbitNumber> MaxOrbitsLen || options.orbitNumber< MinOribtsLen){
      this.lactionError(`Do not support the orbitNumber. The range of orbitNumber must be between ${MinOribtsLen} and ${MaxOrbitsLen}`);
      throw new Error("OrbitNumber out of range!");
    }
  }
  
  // ?????????????????????????????????????????????????????? options.orbitNumber.
  Proto.getOrbitNumber = function(){return this.messageOrbits.length};

  // Only handle one orbit at a time.
  Proto.everyAction = function (queueIndex, next) {
    const messageQueue = this.messageOrbits[queueIndex];
    
    this.eventsRecorder.reset();
    // ??????????????????
    let exeTimes = 0,
        index,
        postMsgLoopActions: Function[] = [];

    // Filter the pre & append loop hooks.
    shallowFilter(messageQueue, hook=>{
      // ???????????? ???????????? ????????????_CONST.ROOT????????? ???????????????????????????????????????????????????
      let result = this.hooks[hook] && this.hooks[hook].level <= _CONST.ROOT && (this.hooks[hook].preMsgLoop || this.hooks[hook].postMsgLoop);
      if(result){
        this.hooks[hook].actions.forEach(action=>{
          // Stage the append loop hook.
          if( this.hooks[hook].postMsgLoop ){
            postMsgLoopActions.push(action);
          }else{
            // invoke pre loop hooks
            action.call(this, messageQueue, {orbitID: queueIndex}); // invoke with nature `this` dominant
          }
        });
      }
      return !result; // filter the corresponding hooks.
    });

    exeTimes = messageQueue.length; // Catch the length of messageQueue before it maybe change. 
    // mian loop
    for (index = 0; index < exeTimes; index++) {
      let currentMsg = messageQueue.shift(),
          hookArguments: unknown[] = [],
          debounceMode = false; // Debounce check.
      
      if(!currentMsg ) continue; // ???????????????????????????
 
      // Function type message. for Debonce. Get the message by return value of the function.
      if (currentMsg.constructor === Function) {
        // Invoke without arguments to keep some sort of security And get the return value. Excepted String|Array Message.
        currentMsg = currentMsg();
        // Record and Discard the message.
        if(!currentMsg){
          this.eventsRecorder.recordEvents(currentMsg+'');
          continue;
        }
        debounceMode = true;
      }
      // Array type message with executive params. Support 'function array' type.
      if (currentMsg && currentMsg.constructor === Array) {
        let realMsg = currentMsg.shift();
        hookArguments = currentMsg;
        currentMsg = realMsg;
      }

      let currentHook = this.hooks[currentMsg];

      // Check the existence.
      if ( (debounceMode || currentHook) ) {
        // _CONST.DEBUG && console.log(`[Orbit msg index${index}] is:`, currentMsg, messageQueue);
        try {
          this.eventsRecorder.recordEvents(currentMsg); // ????????????
          // Debounce type message.
          if (debounceMode){
            // Put off to the next period.
            messageQueue.push(hookArguments.length? (hookArguments.unshift(currentMsg), hookArguments): currentMsg);
            continue;
          }
          // period throttle.
          if (currentHook.once && this.eventsRecorder.isHappened(currentMsg) ){
            // period debounce only go into effect once `once` options setted. Namely the period throttle is on.
            if(currentHook.debounce){
              // set debounce
              if(this.eventsRecorder.isTwice(currentMsg)){
                this.lactionLog(`Debouce the msg ${currentMsg}`);
                messageQueue.push( currentMsg );
              }
            }
            continue;
          }
          
          // ?????????????????????????????? ?????????????????????
          if(currentHook.level > _CONST.ROOT){
            this.lactionLog(`Handled normal msg ${currentMsg} with args:${arguments},debounce:${debounceMode}`);

            currentHook.actions.forEach(element => {
              element(...hookArguments); // invoke with formal `this` dominant
            });
          // The hook whose level is upper than root could controll the execution and invoked with scope `this`
          // ROOT???????????? this ????????????????????????, ??????????????????????????? break, continue, ???????????????????????? ?????????
          }else{
            this.lactionLog(`Root msg ${currentMsg}:`);
            // ????????????????????????????????????????????????????????? ??? everyAction ?????????????????????
            // hookArguments.push(messageQueue);
            currentHook.actions.forEach(element => {
              let indicator = element.apply(this, hookArguments);
              if(!isNaN(indicator)) exeTimes = indicator; // ???????????????????????? ????????? return 0 ???????????????????????????break?????????
            });
          }

          // Set the loop
          if(currentHook.loop===true){
            // continue.
            messageQueue.push(currentMsg);
          }
        } catch (e) {
          this.lactionError(`Message "${currentMsg}" hooks Aborted `, e);
        }
      }
      else {
        // Unknow type or the message hook is not registered.
        this.lactionWarn(`Can not dispose message`, currentMsg, ` which type is:${typeof currentMsg} & ${currentMsg.constructor}`);
      }
    }
    // Invoke the append loop hooks.
    const content = {records: this.eventsRecorder.getRecords(), msgNum: index, orbitID: queueIndex};
    postMsgLoopActions.forEach(action=>{
      action.call(this, messageQueue, content);
    });
    // next loop;
    next && next();
  }

  /**
   * Log the Debug msg when the debug settings is on (true).
   * @param {any} param 
   */
  Proto.lactionLog = function(...param){
    Laction.DEBUG && this.$settings.debug && 
      (param[0] = '[Laction]: ' + param[0], console.log(...param));
  }
  Proto.lactionWarn = function(...param){
    Laction.DEBUG && this.$settings.debug && 
      (param[0] = '[Laction]: ' + param[0], console.warn(...param));
  }
  Proto.lactionError = function(...param){
    Laction.DEBUG && this.$settings.debug && 
      (param[0] = '[Laction]: ' + param[0], console.error(...param));
  }
};

