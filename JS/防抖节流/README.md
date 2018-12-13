#### 防抖 debounce

背景：前端中经常有一些触发比较频繁的事件，比如window的scroll，mousemove，触发频率差不多每秒60次，然而实际我们有时并不需要那么高频次地触发事件，却白白造成性能损失，产生卡顿现象。

例：

~~~js
var count = 1;
var container = document.getElementById('container');

function getUserAction() {
    container.innerHTML = count++;
};

container.onmousemove = getUserAction;
// 触发的频率相当高
~~~



原理：触发事件的n秒后才执行，如果在一个事件触发的n秒内又触发了这个事件，那就以新的事件时间为准，再过n秒后才执行。总之，就是要等你触发完事件 n 秒内不再触发事件，我才执行。



实现：

~~~js
// v1.0
function debounce(func, wait) {
    var timeout;
    return function() {
        //由于闭包，返回的函数可以访问到timeout变量，所以再次调用debounce函数时，会把上一个setTimeout取消，注册新的计时器。
        clearTimeout(timeout);	
        timeout = setTimeout(func, wait);
    }
}
~~~



改进：

1. this丢失

   在getUserAction方法中打印this，在没有使用debounce1.0的时候，值为div结点，使用了debounce1.0后，值为window对象。

   ~~~js
   // v1.1
   function debounce(func, wait) {
       var timeout;
       return function() {
           // 这里的this就是container，因为返回的匿名函数被赋值给了container.onmousemove，所以this就是onmoucemove的调用者container
           var context = this;	
           clearTimeout(timeout);
           timeout = setTimeout(function() {
               //通过apply把container作为func的上下文
               func.apply(context)
           }, wait);
       }
   }
   ~~~

2. event对象

   JS在事件处理函数中会提供事件对象event

   ~~~js
   function getUserAction(event) {
       // 在没有使用debounce时，event指向MouseEvent对象，而使用了debounce后为undefined
       console.log(event);
       container.innerHTML = count++;
   }
   ~~~

   ~~~js
   // v1.2
   function debounce(func, wait) {
       var timeout;
       return function() {
           var context = this;
           var args = arguments;
           clearTimeout(timeout);
           timeout = setTimeout(function() {
               // 把arguments对象作为参数传递给func
               func.apply(context, args);
           }, wait);
       };
   }
   ~~~

3. 立刻执行

   为了让函数更加完善，提出一个新需求：

   不希望等到事件停止触发后才执行，而是立刻执行函数，然后等到停止触发n秒后，才可以重新触发执行。

   ~~~js
   // v1.3
   // 加入一个immediate参数判断是否立刻执行
   function debounce(func, wait, immediate) {
       var timeout;
       return function() {
           var context = this;
           var args = arguments;
           
           if (timeout) clearTimeout(timeout);
           if (immediate) {
               // 如果已经执行过，就不再执行
   			var callNow = !timeout;
               timeout = setTimeout(function() {
                   timeout = null;
               }, wait);
               if (callNow) func.apply(context, )
           } else {
               timeout = setTimeout(function() {
                   func.apply(context, args)
               }, wait);
           }
       }
   }
   ~~~

4. 返回值

   getUserAction有返回值的情况，我们也要返回函数的执行结果。

   ~~~js
   // v1.4
   function debounce(func, wait, immediate) {
       var timeout, result;
       return function() {
           var context = this;
           var args = arguments;
           
           if (timeout) clearTimeout(timeout);
           if (immediate) {
   			var callNow = !timeout;
               timeout = setTimeout(function() {
                   timeout = null;
               }, wait);
               if (callNow) result = func.apply(context, )
           } else {
               timeout = setTimeout(function() {
                   func.apply(context, args)
               }, wait);
           }
           return result;
       }
   }
   ~~~



#### 节流 throttle

原理：持续触发事件，每隔一段事件，只执行一次事件。



实现：

1. 时间戳

   ~~~js
   // v1.0
   // 使用时间戳，当触发事件的时候，我们取出当前的时间戳，然后减去之前的时间戳(最一开始值设为 0 )，如果大于设置的时间周期，就执行函数，然后更新时间戳为当前的时间戳，如果小于，就不执行。
   function throttle(func, wait) {
       var context, args;
       var previous = 0;
   
       return function() {
           var now = +new Date();
           context = this;
           args = arguments;
           if (now - previous > wait) {
               func.apply(context, args);
               previous = now;
           }
       }
   }
   ~~~

2. 定时器

   ~~~js
   // v2.0
   // 当触发事件的时候，我们设置一个定时器，再触发事件的时候，如果定时器存在，就不执行，直到定时器执行，然后执行函数，清空定时器，这样就可以设置下个定时器。
   function throttle(func, wait) {
       var timeout;
       var previous = 0;
   
       return function() {
           context = this;
           args = arguments;
           if (!timeout) {
               timeout = setTimeout(function(){
                   timeout = null;
                   func.apply(context, args)
               }, wait)
           }
   
       }
   }
   ~~~

3. 结合两者优点

   需求：鼠标移入能立刻执行，停止触发的时候还能再执行一次

   ~~~js
   // v3.0
   function throttle(func, wait) {
       var timeout, context, args, result;
       var previous = 0;
       
       var later = function() {
           previous = +new Date();
           timeout = null;
           func.apply(context, args)
       }
       
       var throttled = function() {
           var now = +new Date();
           var remaining = wait - (now - previous);
           context = this;
           args = arguments;
           
           if (remaining <= 0 || remaining > wait) {
               if (timeout) {
                   clearTimeout(timeout);
                   timeout = null;
               }
               previous = now;
               func.apply(context, args)
           } else if (!timeout) {
               timeout = setTimeout(later, remaining);
           }
       }
       return throttled;
   }
   ~~~
