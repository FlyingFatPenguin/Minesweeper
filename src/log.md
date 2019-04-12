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

## fix victory but not finish
victory 添加了状态转换函数


## Fix init() arguments check
1. 当输入的数据小于 `0` 时，会转换为 `0`。
2. 当输入为 `0` 时，生成空白场景。
3. 同时，为了避免输入 `0` 时查找尺寸的
    ```js
    this.block[0].length
    ```
    报错，修改上述写法为：
    ```js
    this.sizeY
    ```


## Add CallBack
1. 全局替换了 `block.length` 为 `sizeX`
2. 添加了四个回调函数
    ```js
    whenInit()
    whenSuccess()
    whenFailure()
    whenFinish()
    ```


## Add Interface setIcon()
### 添加了修改图标接口
该函数可用修改图标
主要的图标有三个
- empty  未点开的位置的值
- flag  右键标雷时的值
- clear  游戏胜利时的值
- num$  `$` 为 0 到 9 表示周围有 `$` 个雷的时候显示的内容

### 修复了剩余雷数量显示异常
剩余雷数量会在游戏结束时不封存，而实际上游戏结束这个值就没有意义了。
修改了游戏结束后就不响应了，并设置为空。

### 完成了getButton 函数的打表法性能优化
设置了一张表，缓存已经请求过的数据。
#### 测试
测试场景 20*20 格 5 雷
chrome 浏览器
Javascript Profiler
优化前getButton 40% 总时间占用
优化后getButton 1% +- 0.5% 

## fix README Image not found Exception
### 问题描述
在 readme 中引用了文件夹中的两张图片，VSCode 可以显示，但是在 gitee 中就不可以显示。

### 产生原因
图片名的大小写和文档中的不一致，图片名 `ClearIcon.png` 路径中 `./img/clearIcon.png`
VSCode 不区分，而 gitee 区分。

### 解决方案
修改了 README 中的引用路径。
（不修改图片名称大小写，是因为 git 检测不到变更，因为 git 默认不区分大小写。
如果要区分，看这里：[解决 Git 默认不区分文件名大小写的问题](https://www.jianshu.com/p/df0b0e8bcf9b)）

### 经验教训
开发环境和运行环境可能不一致，如果可以统一就尽量统一，同时要记得检查运行环境中的表现。


## Optimized _ifBtnDisplayed() function
### 简介
最新的性能测试显示，
性能消耗最高的是 `_ifBtnDisplayed` 函数。
主要原因是该函数需要从 dom 中读取 innerHTML。

### 解决方案
将对于 innerHTML 读写的代码改成
```js
getBtnInnerHtml(x, y);
setBtnInnerHtml(x, y, innerHTML);
```
在 set 后缓存结果，供 get 使用。


## Optimized clickBtn(tar) -> (x,y)
### 简介
该函数是当前的性能瓶颈，由于其需要查找对应的 x,y 坐标。
而从 button 查找 x,y 的时间消耗远远大于从 x,y 查找 button。
所有尝试修改了参数。

## Optimized ifWin()
### 简介
ifWin() 函数通过遍历来记录当前的节点中的显示节点的个数。
添加一个 showNum 来记录这个个数，可以达成优化。

## Fixed position error
### 修正了之前的定位错误
#### 问题描述
当点击时，界面中某个按钮的时候，有可能会发生响应的位置不是当前位置。
如点击屏幕的中间，很可能就会导致左上角的某一个节点被点击。

#### 产生原因
可能是点击的位置不在按钮上，而是按在了两个按钮的交界处。
这时候计算的位置就会发生错误。
由于计算的方法是判断对象位于兄弟节点中的第几个。
1. `button` 在 `td` 中的第 `x` 个。
2. `tr` 在 `table` 中的第 `y` 个。

而如果点击的对象是行对象 `td` 而非 `button`。
那么很显然，计算就变成了：
1. `tr` 在 `table` 中的第 `x` 个。
2. `table` 在 `div` 中的第 `y`（1） 个。

所以 `y` 值被计算为了 `1`。 这也就解释了出现在上方的原因。

#### 解决方法
判断点击对象的类型，如果不是 `button` 那么就不响应。