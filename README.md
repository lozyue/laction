# Laction JS

You can simplely view it as a period publish-subscription system with throttle and debounce support. 


## Description.

Laction js 是一个对分时任务进行节流和防抖控制的一个粗实现控制器。

简单封装了一个使用定时器维护的任务队列，以较好的性能提供给同时大量的任务。

一个可能的用法就是，你可以将一个实例保存到全局，对于分时任务（没有这么高的实时性要求）可以使用`bubble`方法来进行全局调配。



##　Direction:

[使用消息队列] : register -> addAction -> run

[支持的消息类型] : 
  [String Message] 调用对应消息方法, 本周期执行，执行间隔小于周期时间
  [Array Message] String消息和其附带参数构成的参数消息
  [Function Message] 防抖消息，本周期不执行，下一周期执行.执行间隔大于周期时间


## Features (特性):

### Random resolvation

由周期切入点的不确定为钩子响应消息的`invoke`时刻带来不确定性。

让应用程序的体验更加的随机和灵动。


### Efficient

速度几乎接近multi-setInterval/setTimeout, 性能优良。

### Flexible

可添加多种类型钩子和管理，并支持对不同类型的消息进行节流和防抖。

甚至可将节流和防抖同时应用(Precisely says that it is throttle and debounce in a period).


### Facilitate

良好的拓展支持，很容易就能集成更多的模块。


## Options

*// todo*


## APIS

*// todo*

