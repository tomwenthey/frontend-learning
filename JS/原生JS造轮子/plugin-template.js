;// 基础插件模板
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. 注册为一个异步模块
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node 非严格模式的CommonJS
    // 只有CommonJS环境才支持module.exports
    module.exports = factory();
  } else {
    // 浏览器环境 root 就是window对象
    root.returnExports = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // tool
  function extend(o, n, override) {
    for (var p in n) {
      if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override)) {
        o[p] = n[p];
      }
    }
  }

  // polyfill
  // 针对事件注册的一些兼容性做了一些polyfill封装
  var EventUtil = {
    addEvent: function(element, type, handler) {
      // 添加绑定
      if (element.addEventListener) {
        // 使用DOM2级方法添加事件
        element.addEventListener(type, handler, false);
      } else if (element.attachEvent) {
        // 使用IE方法添加事件
        element.attachEvent("on" + type, handler);
      } else {
        // 使用DOM0级方法添加事件
        element["on" + type] = handler;
      }
    },
    // 移除事件
    removeEvent: function(element, type, handler) {
      if (element.removeEventListener) {
        element.removeEventListener(type, handler, false);
      } else if (element.datachEvent) {
        element.detachEvent("on" + type, handler);
      } else {
        element["on" + type] = null;
      }
    },
    getEvent: function(event) {
      // 返回事件对象引用
      return event ? event : window.event;
    },
    // 获取mouseover和mouseout相关元素
    getRelatedTarget: function(event) {
      if (event.relatedTarget) {
        return event.relatedTarget;
      } else if (event.toElement) {
        // 兼容IE8-
        return event.toElement;
      } else if (event.formElement) {
        return event.formElement;
      } else {
        return null;
      }
    },
    getTarget: function(event) {
      //返回事件源目标
      return event.target || event.srcElement;
    },
    preventDefault: function(event) {
      //取消默认事件
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    },
    stopPropagation: function(event) {
      if (event.stopPropagation) {
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
    },
    // 获取mousedown或mouseup按下或释放的按钮是鼠标中的哪一个
    getButton: function(event) {
      if (document.implementation.hasFeature("MouseEvents", "2.0")) {
        return event.button;
      } else {
        //将IE模型下的button属性映射为DOM模型下的button属性
        switch (event.button) {
          case 0:
          case 1:
          case 3:
          case 5:
          case 7:
            //按下的是鼠标主按钮（一般是左键）
            return 0;
          case 2:
          case 6:
            //按下的是中间的鼠标按钮
            return 2;
          case 4:
            //鼠标次按钮（一般是右键）
            return 1;
        }
      }
    },
    //获取表示鼠标滚轮滚动方向的数值
    getWheelDelta: function(event) {
      if (event.wheelDelta) {
        return event.wheelDelta;
      } else {
        return -event.detail * 40;
      }
    },
    // 以跨浏览器取得相同的字符编码，需在keypress事件中使用
    getCharCode: function(event) {
      if (typeof event.charCode == "number") {
        return event.charCode;
      } else {
        return event.keyCode;
      }
    }
  };

  // plugin construct function
  function Plugin(selector, userOptions) {
    // 如果没有通过new 关键字调用Plugin构造函数，则返回new Plugin(...)
    if (!(this instanceof Plugin)) {
      return new Plugin(selector, userOptions);
    }
    this.init(selector, userOptions);
  }

  Plugin.prototype = {
    constructor: Plugin,
    options: {},
    init: function(selector, userOptions) {
      extend(this.options, userOptions, true);
    }
  }

  return Plugin;
}))