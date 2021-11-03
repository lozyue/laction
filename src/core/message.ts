/**
 * Runtime message controls
 */

import { DEBUG, PRECEDENCE } from "../utils/const";
import { is_Array } from "../utils/utils";

export function InitMessage(Laction){
  /**
   * 消息冒泡方法，添加消息到消息队列中，在处理周期将调用对应钩子
   * 支持添加字符串和数组，数组为形式：[messageName, ...message_arguments]
   * @param {String | Array | ()=>String} message The message to awake the hook.
   *  待添加的消息.字符串直接调用对应方法;数组则从第二个参数起为方法参数
   *  String 为普通消息类型， Array为带参数的消息类型，其中数组第一项为消息，后续为参数
   *  Function 类型为特定防抖消息类型。不管函数体如何，必须将目标消息作为返回值，其将在下个执行周期中被解包成普通消息到队列中。
   * @param {Number} orbitID Determine the target orbit index of the message  
   * @param {Boolean} diff decide the mode of the message. 
   *  if it is true, the orbitID will be the index difference to monitor the SetTimeout API.
   */
  Laction.prototype.bubble = function(message, orbitID = -1, diff=false){
    const OrbitLenMax = this.messageOrbits.length;
    // support negative orbit index.
    if(orbitID<0) orbitID += OrbitLenMax;
    // Below diff mode the orbitID should be an positive Integer.
    if(diff){
      const gap = (this.counter+1)% orbitID;
      // DEBUG && console.info(orbitID,  gap, this.counter, this.MaxPeriodCounter);
      
      if(orbitID + gap < OrbitLenMax){
        orbitID = orbitID + gap;
        // continue
      } else {
        // through indirect way by wrap the message.
        const rawMessage = message;
        message = ()=>{
          let repeat = gap;
          const controller = ()=>{
            if(--repeat=== 0) return rawMessage;
            else return controller;
          }
          this.messageOrbits[0].push(controller);
        }
      }
    }
    // check and filter the param.
    const targetOrbit = this.messageOrbits[~~orbitID];
    if(!targetOrbit){
      throw new Error(`[Laction]: Target orbit is not existed with problem param 'orbitID': ${orbitID}`);
    }
    // Pre-check weather the hook of the message is PRECEDENCE hook, which will be pushed with high priority. 
    if (this.hooks[message] && this.hooks[message].level <= PRECEDENCE)
      targetOrbit.unshift(message);
    // Allow all.
    else
      targetOrbit.push(message);

    this.lactionLog(`bubbled msg: "${message}" to queue #${~~orbitID}`)
  }

  /**
   * 消息包装器 用于包装消息成为防抖消息 当前周期不执行，下一周期执行（执行时间大于一个周期）
   * @param {*} message 
   * @param {*} nextPeriod 
   */
  Laction.prototype.decorator = function(message , nextPeriod = true){
    if(nextPeriod)
      return ()=>(message);
    else
      return message;
  }

  /**
   * 查找消息函数
   * 深度查找将会对所有轨道开启消息处理类查找。
   * 不会对debounce类消息进行查找
   * 给`orbitID`传递 -2 以普通查找所有消息轨道
   * @return {Boolean} 是否查找到该消息
   */
  Laction.prototype.find = function (strOrArr, orbitID = -1, deepFind = false){
    if(orbitID < 0) orbitID += this.messageOrbits.length;

    const searchMsg = (orbit)=>{
      orbit.some( (msg)=>{
        // Array type message.
        if( is_Array(strOrArr) )
          return msg === strOrArr[0];
        else
          return msg === strOrArr;
      });
    };
    // deep mode. Find all the orbits.
    if(deepFind){
      return this.messageOrbits.some(searchMsg);
    } else{
      return searchMsg(this.messageOrbits[orbitID]);
    }
  }
  
  /**
   * 队列中的消息的废除消息方法(过滤)
   * 可指定轨道，自定义规则，[快速]限制指定的消息类型，可传递多种类型
   * @param {orbit} 指定消息轨道上的消息进行清除
   * @param {Function} rule
   * @param {Prototype Object} types // 可传递多个参数，指定规定原型内的消息进行删除
   */
  Laction.prototype.revoke = function(orbit = -1, rule=(msg)=>(!msg), ...types){
    if(types.length===0) types = [String, Array];
    // 清除指定轨道
    if(orbit>-1){
      this.messageOrbits[orbit] = this.messageOrbits[orbit].filter((msg)=>{
        return rule(msg) && types.indexOf(msg.constructor)>-1;
      });
    } else {
      this.messageOrbits.forEach((orbit, index, arr)=>{
        this.messageOrbits[orbit] = orbit.filter(msg=>{
          return rule(msg) && types.indexOf(msg.constructor) > -1;
        });
      });
    }
  }
}
