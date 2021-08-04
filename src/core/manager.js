import { arbitraryFree, is_String, is_Array } from "../utils/utils";
import { KERNEL, ROOT, PRECEDENCE, NORMAL, } from '../utils/const';

export function InitManager(Laction){
  /***
   * 注册消息钩子[add Hook]，数组对象方式允许批量注册。重新注册同名消息会进行覆盖
   * 参数传递方法同时支持 以一个数组参数进行传递或者多个参数的方式进行.
   * @param {name: hookName, once:false, actions: func || [...func] }
   * message即对应钩子名, once设定每周期是否只执行一次, hookActions是钩子执行的方法,argument是任意个的钩子执行时的参数数组
   * message应遵循小写下划线规范
   * MessageHook的Action不能单独取消，只能重置重来
   * （弃用）仅在这里允许注册 _CONST.Root Hook 通过设置项目选项`rootHook:true`
   */
  Laction.prototype.registerHook = function (...hooks) {
    const iteratAdd = (proper)=>{
      if(!proper.name){
        console.warn("[Laction]: The name of hook for register is essential!");
        return false;
      }
      // override if existed.
      this.hooks[proper.name] = {
        level: proper.level || NORMAL, // 钩子等级
        once: proper.once, // 周期节流
        debounce: false, // 周期防抖.
        preMsgLoop: proper.preMsgLoop,
        postMsgLoop: proper.postMsgLoop,
        actions: is_Array(proper.actions) ? proper.actions : [proper.actions], // hookAction or hookActions自动结构
      }
    };
    if(hooks.length === 1){
      arbitraryFree(hooks[0], iteratAdd);
    }else
      hooks.forEach(item=>{
        iteratAdd(item);
      });
    return true;
  };

  /**
   * 向已有消息钩子中增加动作 [an Action]. 会预检查钩子存在
   * 多个动作的方式使用多个参数进行传递。
   * 注意：添加的函数就是handle本身，删除需要根据这个 handle 进行查找.
   * @param {String} messageKey
   * @returns {Boolean} 添加成功返回 true.
   */
  Laction.prototype.addAction = function (hookName, ...hookActions) {
    // check the hook presence status.
    const test = this.hooks[hookName];
    if(!test) return false;

    Laction.DEBUG && console.log(`[Laction]: Added an action into ${hookName}`, hookActions);
    test.actions = test.actions.concat(hookActions);
    return true;
  };

  /**
   * 从对应 Hook 中删除对应 Action.
   * 不支持多项删除.
   * @param {Function} handle 
   * @returns {Boolean} 删除成功返回 true.
   */
  Laction.prototype.removeAction = function(hookName, handle){
    // check the hook presence status.
    const test = this.hooks[hookName];
    if(!test) return false;

    let find = test.actions.indexOf(handle);
    if(find>-1){
      test.actions.splice(find,1);
    }
    Laction.DEBUG && console.log(`[Laction]: Removed an action in ${hookName}`, handle);
    return true;
  }

  /**
   * 删除对应Hook的注册; 
   * 删除成功返回true. 支持批量删除(传递对应数组即可).
   * @param
   */
  Laction.prototype.unregisterHook = function(handleOrKey){
    arbitraryFree(handleOrKey, (item)=>{
      // if is removed by key
      if( is_String(item) ){
        this.hooks[item] && delete this.hooks[item];
      }
      // default by register handle
      else{
        const hookList = Object.values(this.hooks);
        hookList.indexOf(item)
      }
    });
  }
  /**
   * 删除对应Hook的注册; 
   * 删除成功返回true. 支持批量删除(传递对应数组即可).
   * @param {String} msgKey 
   * @param {Object} options => {all:Boolean, keys:Array=>[String,...], except:[String,...]} 
   */
  /* Laction.prototype.removeHook = function (msgKey, { ...options } = null) {
    // let test = -1;
    let result = true && this.hooks[msgKey];
    if (options) {
      let inAdditionTo = options.except || options.exclude;
      // 选择式清空（多选可删根级钩子）
      if (options.keys) {
        for (let i in this.hooks) {
          if (options.keys.indexOf(i) > -1 && i.level >= _CONST.ROOT){
            result = result && delete this.hooks[i];
          }
        }
        return result;
      } 
      // 保留式清空(不可删除根级钩子)
      else if (inAdditionTo) {
        for (let i in this.hooks) {
          // 允许数组和字符串, 默认排除根级钩子
          if (inAdditionTo.indexOf(i) > -1);
          else if(i.level > _CONST.ROOT){ // 在undefined、null、NaN等情况下均可信，仅类整型字符串不可信
            result = result && delete this.hooks[i];
          }
        }
        return result;
      // 全部清空, 不包括_CONST.ROOT钩子
      } else if (options.all) {
        for (let i in this.hooks){
          if(i.level > _CONST.ROOT){
            result = result && delete this.hooks[i];
          }
        }
        return result;
      }else {
        console.warn(`[ActionQueue]: invalid options! Should set property "except"or"keys"or"all".Set Null to Disable`);
      }
    }

    // 删除钩子
    return result && this.hooks[msgKey].level>=_CONST.ROOT && delete this.hooks[msgKey];
  } */

}
