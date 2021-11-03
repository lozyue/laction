/**
 * 常量配置文件
 * 方便进行管理和拓展
 */

// 生产调试：
const DEBUG = true && process.env.NODE_ENV !== 'production';
const INFOR = true;

/**
 * 定义消息钩子的`level`标识：
 * 优先级严格按照顺序排列
 * ROOT级别以上钩子的触发消息不会出现在消息队列中被记录下来
 *     并且执行是作用域为this
 * 其余钩子执行时作用域保持自身不变
 */
const KERNEL = 0; // 核心级钩子，无法删除
const ROOT = 1; // 根级钩子，受到removeHook保护
const PRECEDENCE = 2; // 提升precedence(优先n.)钩子
const NORMAL = 3; // 普通钩子

export const PrimeNumber = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41]; // 2^53-1
export const MinOribtsLen = 1; 
export const MaxOrbitsLen = 40;

export {
  DEBUG, INFOR,
  KERNEL, ROOT, PRECEDENCE, NORMAL,
};
