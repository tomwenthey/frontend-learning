// 基础插件模板
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. 注册为一个异步模块
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    // Node 非严格模式的CommonJS
    // 只有CommonJS环境才支持module.exports
    module.exports = factory();
  } else {
    // 浏览器环境 root 就是window对象
    root.returnExports = factory();
  }
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  // tool
  function extend(o, n, override) {
    for (var p in n) {
      if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override)) {
        o[p] = n[p];
      }
    }
  }

  // 元素类名
  var CLASS_NAME = {
    ITEM: "pagination-item",
    LINK: "pagination-link"
  };

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

  function $(selector, context) {
    context = arguments.length > 1 ? context : document;
    return context ? context.querySelectorAll(selector) : null;
  }

  var Pagination = function(selector, pageOption) {
    // 默认配置
    this.options = {
      curr: 1,
      pageShow: 2,
      ellipsis: true,
      hash: false
    };
    // 合并配置
    extend(this.options, pageOption, true);
    // 分页器元素
    this.pageElement = $(selector)[0];
    // 数据总数
    this.dataCount = this.options.count;
    // 当前页码
    this.pageNumber = this.options.curr;
    // 总页数
    this.pageCount = Math.ceil(this.options.count / this.options.limit);
    // 渲染
    this.renderPages();
    // 执行回调函数
    this.options.callback &&
      this.options.callback({
        curr: this.pageNumber,
        limit: this.options.limit,
        isFirst: true
      });
    // 改变页数并触发事件
    this.changePage();
  };

  Pagination.prototype = {
    constructor: Pagination,
    pageInfos: [
      {
        id: "first",
        content: "首页"
      },
      {
        id: "prev",
        content: "前一页"
      },
      {
        id: "next",
        content: "后一页"
      },
      {
        id: "last",
        content: "尾页"
      },
      {
        id: "",
        content: "..."
      }
    ],
    getPageInfos: function(className, content) {
      return {
        id: "page",
        className: className,
        content: content
      };
    },
    pageHash: function() {
      if (this.options.hash) {
        window.location.hash = '#!' + this.options.hash + '=' + this.pageNumber;
      }
    },
    renderPages: function() {
      this.pageElement.innerHTML = "";
      if (this.options.ellipsis) {
        this.pageElement.appendChild(this.renderEllipsis());
      } else {
        this.pageElement.appendChild(this.renderNoEllipsis());
      }
    },
    changePage: function() {
      var self = this;
      var pageElement = self.pageElement;
      EventUtil.addEvent(pageElement, "click", function(ev) {
        var e = ev || window.event;
        var target = e.target || e.srcElement;
        if (target.nodeName.toLocaleLowerCase() == "a") {
          if (target.id === "prev") {
            self.prevPage();
          } else if (target.id === "next") {
            self.nextPage();
          } else if (target.id === "first") {
            self.firstPage();
          } else if (target.id === "last") {
            self.lastPage();
          } else if (target.id === "page") {
            self.goPage(parseInt(target.innerHTML));
          } else {
            return;
          }
          self.renderPages();
          self.options.callback &&
            self.options.callback({
              curr: self.pageNumber,
              limit: self.options.limit,
              isFirst: false
            });
        }
      });
    },
    addFragmentBefore: function(fragment, datas) {
      fragment.insertBefore(this.createHtml(datas), fragment.firstChild);
    },
    addFragmentAfter: function(fragment, datas) {
      fragment.appendChild(this.createHtml(datas));
    },
    prevPage: function() {
      this.pageNumber--;
    },
    nextPage: function() {
      this.pageNumber++;
    },
    goPage: function(pageNumber) {
      this.pageNumber = pageNumber;
    },
    firstPage: function() {
      this.pageNumber = 1;
    },
    lastPage: function() {
      this.pageNumber = this.pageCount;
    },
    createHtml: function(elemDatas) {
      var self = this;
      var fragment = document.createDocumentFragment();
      var liEle = document.createElement("li");
      var aEle = document.createElement("a");
      elemDatas.forEach(function(elementData, index) {
        liEle = liEle.cloneNode(false);
        aEle = aEle.cloneNode(false);
        liEle.setAttribute("class", CLASS_NAME.ITEM);
        aEle.setAttribute("href", "javascript:;");
        aEle.setAttribute("id", elementData.id);
        if (elementData.id !== "page") {
          aEle.setAttribute("class", CLASS_NAME.LINK);
        } else {
          aEle.setAttribute("class", elementData.className);
        }
        aEle.innerHTML = elementData.content;
        liEle.appendChild(aEle);
        fragment.appendChild(liEle);
      });
      return fragment;
    },
    renderNoEllipsis: function() {
      var fragment = document.createDocumentFragment();
      if (this.pageNumber < this.options.pageShow + 1) {
        fragment.appendChild(this.renderDom(1, this.options.pageShow * 2 + 1));
      } else if (this.pageNumber > this.pageCount - this.options.pageShow) {
        fragment.appendChild(
          this.renderDom(
            this.pageCount - this.options.pageShow * 2,
            this.pageCount
          )
        );
      } else {
        fragment.appendChild(
          this.renderDom(
            this.pageNumber - this.options.pageShow,
            this.pageNumber + this.options.pageShow
          )
        );
      }
      if (this.pageNumber > 1) {
        this.addFragmentBefore(fragment, [
          this.pageInfos[0],
          this.pageInfos[1]
        ]);
      }
      if (this.pageNumber < this.pageCount) {
        this.addFragmentAfter(fragment, [this.pageInfos[2], this.pageInfos[3]]);
      }
      return fragment;
    },
    renderEllipsis: function() {
      var fragment = document.createDocumentFragment();
      this.addFragmentAfter(fragment, [
        this.getPageInfos(CLASS_NAME.LINK + " current", this.pageNumber)
      ]);
      for (var i = 1; i <= this.options.pageShow; i++) {
        if (this.pageNumber - i > 1) {
          this.addFragmentBefore(fragment, [
            this.getPageInfos(CLASS_NAME.LINK, this.pageNumber - i)
          ]);
        }
        if (this.pageNumber + i < this.pageCount) {
          this.addFragmentAfter(fragment, [
            this.getPageInfos(CLASS_NAME.LINK, this.pageNumber + i)
          ]);
        }
      }
      if (this.pageNumber - (this.options.pageShow + 1) > 1) {
        this.addFragmentBefore(fragment, [this.pageInfos[4]]);
      }
      if (this.pageNumber > 1) {
        this.addFragmentBefore(fragment, [
          this.pageInfos[0],
          this.pageInfos[1],
          this.getPageInfos(CLASS_NAME.LINK, 1)
        ]);
      }
      if (this.pageNumber + this.options.pageShow + 1 < this.pageCount) {
        this.addFragmentAfter(fragment, [this.pageInfos[4]]);
      }
      if (this.pageNumber < this.pageCount) {
        this.addFragmentAfter(fragment, [
          this.getPageInfos(CLASS_NAME.LINK, this.pageCount),
          this.pageInfos[2],
          this.pageInfos[3]
        ]);
      }
      return fragment;
    },
    renderDom: function(begin, end) {
      var fragment = document.createDocumentFragment();
      var str = "";
      for (var i = begin; i <= end; i++) {
        str =
          this.pageNumber === i
            ? CLASS_NAME.LINK + " current"
            : CLASS_NAME.LINK;
        this.addFragmentAfter(fragment, [this.getPageInfos(str, i)]);
      }
      return fragment;
    }
  };

  return Pagination;
});
