## 外投唤醒脚本
@bibo.bb

### 注意事项
此脚本不会判断当前环境是否是APP内，如果有APP内不唤醒的需求，需要自己先行判断。

### 使用方式
wakeup接受两个参数，第一个url是唤醒的目的页面地址，必须制定，第二个是配置项，可省略。
```javascript
var Wakeup = require('app/atom/wakeup')
Wakeup(url, [options])
```

### 关于options
options是一个对象，用于定义其他配置：
- `scheme` 通过配置URL Scheme指定唤醒的app，如scheme: 'tmall:'。默认为唤醒手淘。
- `loadCB` wakeup在某些情况下需要监听页面onload事件，为了不与开发者其他地方的onload处理有矛盾，支持传入开发者自己触发的函数，用法请参考：

```javascript
function load(cb) {
    cb && cb();
}
wakeup('http://www.taobao.com', {loadCB: load});
window.addEventListener('load', function() {
    load();
    //以下是开发者自己的逻辑...
})
```
