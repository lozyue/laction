/**
 * laction JS 全局混入API模块
 * 用于在 laction 实例化前调用的注入到实例化后的对象中去的方法
 * 也即插件内部install方法会在实例化前调用
 * eg: 
 * import laction;
 * laction.use(lzycabinet, {period: 3000,});
 * var la = new laction({...});
 */

export function InitMixin(Laction){
  Laction.prototype.mixins = []; // 这样初始化类实例中没有这个属性，而是在构造器本身上; 而 在构造函数内可以生成，现在this还未初始化

  // 允许laction实例化前调用以混入所有实例；实例内调用只影响当前实例
  // 非原型链方法 而是构造器方法 这样可以使得每个实例维护一份自己的MixinAPI
  Laction.mixin = function (mixinFunc) {
    Laction.prototype.mixins.push(mixinFunc);
    return this;
  };
  
  // 实例化后调用，混入实例
  Laction.prototype._mixinInit = function(...options){
    options.unshift(this);
    this.mixins.forEach(v=>{v.apply(v, options)});
  };
};
