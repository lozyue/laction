/**
 * Add alias to some methods.
 * 适配不同用户的使用习惯，对部分方法增加一些别名
 */

export function initAlias(Laction){
  // remove hook
  Laction.prototype.removeHook = Laction.prototype.unregisterHook;

  // bubble
  Laction.prototype.emit = Laction.prototype.bubble;
}
