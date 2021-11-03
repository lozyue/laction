'use strict';

import { PrimeNumber } from './const';

/**
 * check type of an Object is Array or not
 * @param {*} obj 
 */

export const isLightBuild = false;

export const is_Defined = (v) => (v !== undefined && v !== null);
export const is_String = (str) => ((typeof str === 'string') && str.constructor == String);
export const is_Array = (obj) => (Array.isArray && Array.isArray(obj) || (typeof obj === 'object') && obj.constructor == Array);
export const is_PlainObject = (obj: null|Object):Boolean => (Object.prototype.toString.call(obj) === '[object Object]');

/**
 * Filter Array with condition.
 * Make origin Array content Changes.
 * @param {*} arr 
 * @param {*} filter 
 */
export function shallowFilter<T> (arr: Array<T>, filter: (T)=>Boolean){
  for(let index=0; index<arr.length; index++){
    let needs = filter(arr[index]);
    if(!needs){
      arr.splice(index, 1);
      // amend index
      index--;
    }
  }
  return arr;
}

/**
 * Just assign the item in supplement which not defined in target.
 * If you don't want to override the value of origin Object, supplement is the high performance choice.
 * Deep mode by iterate each inner Object.
 * @param {*} target 
 * @param {*} supplement 
 */
export function deepSupplement<R extends Object, T extends Object> (target: R|null, supplement: T) {
  if(!target) return supplement;
  let current: unknown = null;
  for (let item in supplement) {
    current = (target as unknown as T)[item];
    if (is_Defined(current)) {
      if (!is_PlainObject(current as Object)) continue;
      deepSupplement(current as Object, supplement[item]); // The `current` is a reference which could be assigned.
    }
    else
      // current = supplement[item];
      (target as unknown as T)[item] = supplement[item];
  }
  return target as (R & T);
}

/**
 * Wrap the stuff with inputs, accept Array or Non-Array input. 
 * A list of arguments with truth check for condition logical supplement. 
 * @param  {...any} inputs 
 * @returns { Array } returns the wrapped array.
 */
export function arbitraryWrap<T> (...inputs: Array<Array<T>|T>): Array<T>{
  const backArray: Array<any> = [];
  let item;
  for(let index=0; index<inputs.length; index++){
    item = inputs[index];
    if(!is_Defined(item) ){
      continue;
    }
    if(is_Array(item) ){
      // for(let i=0;i<item.length;i++)
      //   backArray.push(item[i]);
      backArray.splice(backArray.length-1, 0, ...item);
    } else {
      backArray.push(item);
    }
  };
  return backArray;
}

/**
 * Provide with a processor accept a list of stuff or single stuff
 * Give it the action to its inner iterator.
 * The original Stuff can not be an Array!
 */
export function arbitraryFree<T> (input: Array<T>|T, func: (a:T, b:number)=>any): Array<any>|any{
  if(is_Array(input) ){
    return (input as Array<T>).map(func);
  } else{
    // callback(item, index)...
    return func((input as T), 0);
  }
}

export const removeArrayItem = <T>(arr:Array<T>, item:T)=>{
  if (arr.length) { 
    let index = arr.indexOf(item); 
    if (index > -1) { 
      return arr.splice(index, 1); 
    } 
  } 
}

/**
 * Least common multiple.
 * From 1 to N. (N<41)
 */
export const LCMtoN = (num: number)=>{
  let maxIndex = 0;
  let multiple = 1;
  while(PrimeNumber[maxIndex]<num) maxIndex++;
  let interior; let temp = 1;
  for(let i=0; i<maxIndex; i++){
    interior = 1; temp = num / PrimeNumber[i];
    while(interior<temp) interior*=PrimeNumber[i];
    multiple *= interior;
  }
  return multiple;
};
