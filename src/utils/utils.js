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
 * Shallow Filter.
 * @param {*} arr 
 * @param {*} filter 
 */
export function shallowFilter(arr, filter){
  // let item;
  for(let index=0;index<arr.length;index++){
    // item = arr[index];
    let needs = filter(arr[index]);
    if(!needs)
      arr.splice(index, 1);
  }
  return arr;
}

/**
 * Wrap the stuff with inputs, accept Array or Non-Array input. 
 * A list of arguments with truth check for condition logical supplement. 
 * @param  {...any} inputs 
 * @returns { Array } returns the wrapped array.
 */
export function arbitraryWrap(...inputs){
  const backArray = [];
  let item;
  for(let index=0; index<inputs.length; index++){
    item = inputs[index];
    if(!is_Defined(item) ){
      continue;
    }
    if(is_Array(item) ){
      backArray.concat(item);
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
export function arbitraryFree(input, func){
  if(is_Array(input) ){
    return input.map(func);
  } else{
    return func(input, 0);
  }
}
