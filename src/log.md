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

## fix control disappear error
`0.1.1` 中说有控件消失问题，这里解决了
原因是修改当前按钮的数据的时候，可能点击的对象不是按钮，
而是表格，当修改 innerHTML 后，表格就会消失。

## add gameOverAnimation
结束动画使用了回调函数，如果此时更新会导致问题。

## add victory animation

## Auto click 0
自动点击 0 节点，同时为了更像原始游戏，设置了 0 节点显示空格。