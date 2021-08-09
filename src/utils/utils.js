'use strict';
/**
 * check type of an Object is Array or not
 * @param {*} obj 
 */

export const isLightBuild = false;

export const is_Defined = (v) => (v !== undefined && v !== null);
export const is_String = (str) => ((typeof str === 'string') && str.constructor == String);
export const is_Array = (obj) => (Array.isArray && Array.isArray(obj) || (typeof obj === 'object') && obj.constructor == Array);


/**
 * Provide with a processor accept a list of stuff or single stuff
 * Give it the action to its inner iterator.
 * The original Stuff can not be an Array!
 */
export function arbitraryFree(input, func){
  if(is_Array(input) ){
    return input.map(func);
  } else{
    return func(input, 0);
  }
}
