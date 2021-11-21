import { arbitraryFree, is_String, is_Array, arbitraryWrap, removeArrayItem, deepSupplement, is_Defined } from "../utils/utils";
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
      if(!proper.name || !(proper.actions|| proper.action)){
        console.warn("[Laction]: The property 'name'and the 'actions' for hook register is essential!");
        return false;
      }
      // override if existed.
      this.hooks[proper.name] = deepSupplement(proper, {
        level: NORMAL, // 钩子等级
        once: false, // 周期节流
        debounce: false, // 周期防抖.
        loop: false, // 是否循环调用，继函数内嵌外的内部解决方案.
        preMsgLoop: false,
        postMsgLoop: false,
      });
      // support single action type.
      // hookAction or hookActions自动结构
      this.hooks[proper.name].actions = arbitraryWrap(proper.actions, proper.action);
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
   * Test if the hookName is used or find a proper hookName.
   * @param { Boolean } postfix When set this on, the returns will be a unregister root String
   *  by add number postfix if it has conflict originally.
   */
  Laction.prototype.testHookName = function (root: string, postfix = false) {
    if(is_Defined(this.hooks[root]) ){
      if(!postfix) return true;
      else{
        // Find by add Number postfix.
        let i = 0, temp ='';
        while(i++ < 2e16){ // That's enough.
          temp = root + i;
          if(!is_Defined(this.hooks[temp]) )
            return temp;
        };
      }
    }else{
      if(postfix) return root;
      return false;
    }
  }

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

    this.lactionLog(`Added an action into ${hookName}`, hookActions);
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
    this.lactionLog(`Removed an action in ${hookName}`, handle);
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
        removeArrayItem(hookList, item);
      }
    });
  }
}
