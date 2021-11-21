/**
 * To help invoke the message.
 * @param {*} Laction 
 */

export function InitRecorder(Laction){
  // As an Object.
  Laction.prototype.eventsRecorder = {
    _did_queue: {},
    recordEnhance: false, // 调试下启用，记录各种_CONST.Root级以上消息执行次数. 默认只记录解包后的字符串类型
    recordEvents: function(currentMsg){
      if(!this.recordEnhance && currentMsg.constructor!==String) return false;
      // 从零开始的初始消息事件记录
      this._did_queue[currentMsg] >= 0 ? ++this._did_queue[currentMsg] : this._did_queue[currentMsg] = 0;
    },
    // the up and down method has no check.
    upEvent: function(msg){
      this._did_queue[msg]++;
    },
    downEvent: function(msg){
      this._did_queue[msg]--;
    },
    // 是否执行过一次 检测节流与否
    isHappened: function(msg){
      return !!this._did_queue[msg];
    },
    // 是否处理过两次（要结合isHappened一起判断） 检测防抖与否
    isTwice: function(msg){
      return this._did_queue[msg] === 1;
    },
    reset: function(){
      this._did_queue = {};
      return true;
    },
    getRecords: function(msg=null){
      if(msg && this._did_queue[msg]) return this._did_queue[msg];
      return this._did_queue;
    },
  }
}