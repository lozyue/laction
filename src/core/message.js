/**
 * Runtime message controls
 */

import { DEBUG } from "../utils/const";
import { is_Array } from "../utils/utils";

export function InitMessage(Laction){
    /**
   * 消息冒泡方法，添加消息到消息队列中，在处理周期将调用对应钩子
   * 支持添加字符串和数组，数组为形式：[messageName, ...message_arguments]
   * @param {String | Array | ()=>String} message 待添加的消息.字符串直接调用对应方法;数组则从第二个参数起为方法参数
   *  String 为普通消息类型， Array为带参数的消息类型，其中数组第一项为消息，后续为参数
   *  Function 类型为特定防抖消息类型。不管函数体如何，必须将目标消息作为返回值，其将在下个执行周期中被解包成普通消息到队列中。
   */
  Laction.prototype.bubble = function(message, orbitID = -1){
    // 支持负引索，如 -1 表示 最后一条轨道
    if(orbitID<0) orbitID += this.$settings.orbitNumber;
    // 预检查是否为内置钩子, 以不同优先级方式推入消息队列
    if (this.hooks[message] && this.hooks[message].level <= _CONST.PRECEDENCE)
      this.messageOrbits[orbitID].unshift(message);
    // 允许预期外的消息入队
    else
      this.messageOrbits[orbitID].push(message);

    DEBUG && console.log(`[Laction]: bubbled msg: [${message}]`)
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
    if(orbitID < 0) orbitID += this.$settings.orbitNumber;

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
}