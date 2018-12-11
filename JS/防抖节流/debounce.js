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
      if (callNow) result = func.apply(context);
    } else {
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    }
    return result;
  };
}

var count = 1;
var container = document.getElementById("container");

function getUserAction(e) {
  container.innerHTML = count++;
  console.log(this);
  console.log(e);
}

container.onmousemove = debounce(getUserAction, 500, true);
// container.onmousemove = getUserAction;
