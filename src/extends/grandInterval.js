/**
 * [拓展模块][内置类] 用于启动更多倍率的定时器队列，同时受主消息队列共同控制
 * 算是对定时任务范围不足的一个补救
 * var minuteInterval = new laction.GrandInterval(9,12,()=>{todo()}); // 启动一个60秒定时任务的计时器
 * @param {Integer} base_orbitID // 定时器依赖挂载的轨道，eg：0-9确定初始时间0.5s-5s（具体请参考原理）
 * @param {Integer} multiple // 倍率，其乘以初始时间 得到最终的定时器总时间
 * @param {Function} assignment // 需要执行的挂载回调；错误，现已改为类模式，可后续指定任务
 */

export function initGrandInterval(laction){
  laction.prototype.createGradLaction = function(base_orbitID, multiple){
    return new this.GrandInterval(base_orbitID, multiple);
  }
  laction.prototype.GrandInterval = function(base_orbitID, multiple){
    const _this = this;
    const _parent = laction; // x ? this
    // 预检查
    this.multiple = ~~multiple; // 这样也保证multiple不会是一个超过2^32次方的数 同时自动处理 NaN 值转化为0
    this.base_orbitID = base_orbitID;
    if(!_parent.messageOrbits[this.base_orbitID] || !this.multiple) return 0;
    this.counter = 0; // 倍率计数器
    this.assignments = []; // 执行队列
    this.messageKey = `GI_${this.base_orbitID}_${this.multiple}`; // 消息key(内置)

    this.init = function(){
      // 预定根级初始钩子队列
      _parent.register([{
        message: _this.messageKey,
        rootHook: true,
        once: true,
        actions: [()=>{
          _this.counter = ++_this.counter % this.multiple;
          if(_this.counter===0) _this.assignments.forEach((assign)=>{assign.call(assign)});
          _parent.messageOrbits[this.base_orbitID].push(_this.messageKey); // 消息循环
        }],
      }]);
      // 启动GrandInterval定时器
      _parent.bubble(this.messageKey, false, this.base_orbitID);
    }
    // 对本类添加动作的方法：
    this.addAction = function(action){this.assignments.push(action)};
    // 清空队列
    this.clearAction = function(id = -1, num=1){
      if(id>-1) this.assignments.splice(id, num); // 指定从id索引出删除num个元素
      else this.assignments= []; // 否则全部清空
    };
    // "析构函数"
    this.destroy = function(){
      this.clearAction();
      _parent.removeHook(this.messageKey);
      // 删除消息队列中目标的循环消息
      _parent.revoke(this.base_orbitID,(msg)=>{
        return msg===this.messageKey;
      }, String);
    };
    // 启动
    this.init();
  }
}
