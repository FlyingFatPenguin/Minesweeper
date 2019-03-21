# 开发日志
## 0.1
修改了之前使用图片作为背景的方法。直接设置按钮的背景

## 0.1.1
添加了事件处理函数。可以完成扫雷游戏。
但是有如下的问题：
1. Firefox 下无 event 对象
2. 拖动按钮会导致控件消失

## fix pos error
之前的 x, y 计算是反的，导致数组会发送越界，现在修复了。
```js
let y = this.indexOfList(tar.parentElement);
let x = this.indexOfList(tar.parentElement.parentElement);
```
