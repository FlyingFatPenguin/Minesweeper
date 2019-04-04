// 创建一个扫雷模块
function Field(x, y, minesNum) {
  this._state = this._allStates.created;
  this._timeOutList = [];
  this.whenInit = function () {};
  this.whenFinish = function () {};
  this.whenSuccess = function () {};
  this.whenFailure = function () {};
}

Field.prototype = {
  _mine: -1, // 地雷
  _empty: 0, // 空地
  _allStates: { // 游戏状态
    created: 0, // 初始状态
    init: 1, // 创建完成 dom
    start: 2, // 可以开始游戏
    finish: 3, // 游戏结束
    failure: 4, // 游戏失败
    success: 5, // 游戏胜利
  },
  _icon: {
    num0: ' ',
    num1: '1',
    num2: '2',
    num3: '3',
    num4: '4',
    num5: '5',
    num6: '6',
    num7: '7',
    num8: '8',
    num9: '9',
    empty: '', // 未点击的地方
    flag: '🚩', // 右键标记
    clear: '  ', // 已经排除的雷（为了不同，初始化为两个空格）
  },
  setIcon: function (iconName, icon) {
    let currentIcon = this._icon[iconName];

    if (typeof icon !== 'string') {
      return false;
    }

    // 不允许和其他图标相同，和自己相同也不用继续设置
    for (let i in this._icon) {
      if (this._icon[i] === icon) {
        if (i === iconName) { // 如果已经设置成功了，就返回 true
          return true;
        }
        return false;
      }
    }

    if (currentIcon === undefined) {
      return false;
    }

    this._forEach((x, y) => {
      let btn = this.getButton(x, y);
      if (this.getBtnInnerHtml(x, y) === currentIcon) {
        // btn.innerHTML = icon;
        this.setBtnInnerHtml(x, y, icon);
      }
    });

    this._icon[iconName] = icon;
    return true;
  },
  _forEach: function (callback) {
    let sizeX = this.sizeX;
    let sizeY = this.sizeY;
    for (let i = 0; i < sizeX; i++) {
      for (let j = 0; j < sizeY; j++) {
        callback(i, j);
      }
    }
  },
  _btnColor: {
    unshow: 'blue', // 未显示
    secure: 'white', // 显示，但是不是雷
    mine: 'red', // 显示，地雷
    clear: 'green', // 安全排除的地雷
    flag: 'white', // 旗子背景
  },
  /**
   * 状态转换函数
   * @param {Number} tarState this._states 的枚举
   */
  _stateTransition: function (tarState) {
    this._state = tarState;

    // 设置回调
    let states = this._allStates;
    switch (tarState) {
      case states.init: // 启动
        this._clearMyTimeOut();
        this._getBtn = []; // 重置 btn 优化
        this._innerHTML = []; // ifBtnDisplay 优化
        this._runCallBack(this.whenInit);
        break;
      case states.success: // 成功 --> 结束
        this._runCallBack(this.whenSuccess);
        this._stateTransition(states.finish);
        break;
      case states.failure: // 失败 --> 结束
        this._runCallBack(this.whenFailure);
        this._stateTransition(states.finish);
        break;
      case states.finish: // 结束
        this._runCallBack(this.whenFinish);
        break;
      default:
        break;
    }
  },

  _runCallBack: function (func, ...arg) {
    if (typeof func === 'function') {
      func.apply(this, arg);
    }
  },
  /**
   * 初始化地图
   * @param {Number} x 场地宽带 
   * @param {Number} y 场地高度
   * @param {Number} minesNum 雷的数量
   * TODO:
   * 输入数值合法性检查
   */
  init: function (x, y, minesNum) {
    x = parseInt(x);
    y = parseInt(y);
    minesNum = parseInt(minesNum);

    // 取正
    x = x > 0 ? x : 0;
    y = y > 0 ? y : 0;
    minesNum = minesNum > 0 ? minesNum : 0;

    this.sizeX = x;
    this.sizeY = y;
    this.minesNum = minesNum < x * y ? minesNum : x * y;


    // 初始化雷的位置
    let minesPos = this._countMinesPos(x, y, minesNum);

    // 初始化场地
    this.block = [];
    for (let i = 0; i < x; i++) {
      this.block[i] = [];
    }

    // 添加地雷
    for (let i in minesPos) {
      let [x, y] = minesPos[i];
      // console.log(minesPos)
      // console.log(x + ' ' + y)
      this.block[x][y] = this._mine;
    }

    // 计算其他位置的值
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        this.block[i][j] = this._MinesNumNearby(i, j);
      }
    }

    this._normalizedStructure();
    this._stateTransition(this._allStates.init);
  },
  /**
   * 获取一个 dom 结构的 根节点
   */
  getDomRoot: function () {
    if (!this.dom) {
      this.dom = document.createElement('div');
    }
    return this.dom;
  },
  /**
   * 生成地雷位置
   * @param {Number} x 场地宽带 
   * @param {Number} y 场地高度
   * @param {Number} minesNum 雷的数量
   * @returns {Array} minesPos [ [x1, y1], [x2, y2] ]
   */
  _countMinesPos: function (x, y, minesNum) {
    // 产生所有可能的位置
    let allPos = []; // 所有位置
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        allPos.push([i, j]);
      }
    }

    // 从中随机选取 minesNum 个
    let minesPos = []; // 雷的位置
    while (allPos.length && minesPos.length < minesNum) {
      let index = Math.floor(Math.random() * allPos.length);
      let pos = allPos.splice(index, 1);
      minesPos.push(pos[0])
    }
    return minesPos;
  },
  /**
   * 获取周遭雷的数量
   * @param {Number} x 当前位置 
   * @param {Number} y 当前位置 
   */
  _MinesNumNearby: function (x, y) {
    let block = this.block;
    if (block[x][y] === this._mine) {
      return block[x][y];
    } else {
      let minesNum = 0;
      for (let i = x - 1; i < x + 2; i++) {
        for (let j = y - 1; j < y + 2; j++) {
          if (block[i] && block[i][j] === this._mine) {
            minesNum++;
          }
        }
      }
      return minesNum;
    }
  },
  // /**
  //  * 更新场景
  //  */
  // updateField: function () {
  //   // 规范化结构
  //   this._normalizedStructure();

  //   // 更新数据

  // },
  /**
   * 规范 dom 结构与 block 中的一致
   */
  _normalizedStructure: function () {
    let root = this.getDomRoot();
    // 清空所有子节点
    root.innerHTML = '';
    let table = document.createElement('table');
    // let tbody = table.appendChild(document.createElement('tbody'));
    let tr = document.createElement('tr');
    for (let i = 0; i < this.sizeY; i++) {
      let td = tr.appendChild(document.createElement('td'));
      let btn = td.appendChild(document.createElement('button'))
      btn.innerHTML = this._icon.empty;
    }
    for (let i = 0; i < this.sizeX; i++) {
      table.appendChild(tr.cloneNode(true));
    }
    root.appendChild(table);

    // 为 table 设定监听器
    table.addEventListener('click', (event) => {
      // 获取最终点击的节点
      let tar = event.target;

      let {
        x,
        y
      } = this.getBtnIndex(tar);
      this.clickBtn(x, y);
    }, false);

    table.addEventListener('contextmenu', (event) => {
      // 阻止默认事件
      event.preventDefault();

      // 获取最终点击的节点
      let tar = event.target;
      let {
        x,
        y
      } = this.getBtnIndex(tar);
      this.contextmenuBtn(x, y);
    })
  },
  contextmenuBtn: function (x, y) {
    const tar = this.getButton(x, y);
    // 如果游戏终止了，就不再响应该事件
    if (this._state === this._allStates.finish) {
      return;
    }

    // 去除点击目标非 button 的情况
    if (!tar.localName === 'button') {
      return;
    }

    // 获取节点的x, y
    // let y = this.indexOfList(tar.parentElement);
    // let x = this.indexOfList(tar.parentElement.parentElement);


    // 如果点击目标已经被点击过
    if (this._ifBtnDisplayed(x, y)) {
      // 如果是插了旗子，拔掉
      if (this._ifFlag(x, y)) {
        this._unshow(x, y);
      } else {
        // 此处不是旗子，而是已经点过了的地方
        // 这里右键就相当于标准游戏中的双键
        // 即，如果周围的标记雷的个数等于当前的数字
        // 就点开周围所有位置
        let near = this.surroundNodes(x, y);
        let flagNum = 0;
        for (let i in near) {
          let [x, y] = near[i];
          if (this._ifFlag(x, y)) {
            flagNum++;
          }
        }
        if (flagNum < this.block[x][y]) {
          return;
        }

        for (let i in near) {
          let [x, y] = near[i];
          if (!this._ifFlag(x, y)) {
            this.clickBtn(x, y);
          }
        }
      }
      return;
    }

    // 插旗子
    this._showFlag(x, y);
  },
  /**
   * 按钮被点击后的事件响应，变色及其他事件
   * @param {Button} tar 按钮
   */
  clickBtn: function (x, y) {
    // 如果游戏终止了，就不再响应该事件
    if (this._state === this._allStates.finish) {
      return;
    }

    // 去除点击目标非 button 的情况
    // if (!tar.localName === 'button') {
    //   return;
    // }

    // 如果点击目标已经被点击过了，就不再响应
    if (this._ifBtnDisplayed(x, y)) {
      return;
    }

    this._show(x, y); // 设置 tar 避免查找，优化性能

    // 判断游戏状态
    if (this.block[x][y] === this._mine) {
      this._gameOver(x, y);
    } else {
      if (this._ifWin()) {
        this._victory();
      }
    }

    // 如果出现了 0 ，自动点击周围的节点
    if (this.block[x][y] === 0) {
      // console.log('发现 0 节点');
      let near = this.surroundNodes(x, y);
      // console.log(near);
      for (let i in near) {
        let [x, y] = near[i];
        this.clickBtn(x, y);
      }
    }

    // 自动右击可以展开的对象
    // this.contextmenuBtn(x, y);
  },
  /**
   * 游戏结束
   * 播放游戏结束动画，同时不再响应鼠标点击
   * @param {Number} x 结束动画的中心
   * @param {Number} y 
   */
  _gameOver: function (x = 0, y = 0) {
    this._stateTransition(this._allStates.failure);

    // 游戏结束动画
    this._gameOverAnimation(x, y);
  },
  /**
   * 游戏结束动画
   */
  _gameOverAnimation: function (x = 0, y = 0) {
    // 实现中心扩散的动画效果
    // console.log('当前中心' + x + ', ' + y);

    // 计算到达时间
    let maxX = this.sizeX;
    let maxY = this.sizeY;

    let map = [];
    for (let i = 0; i < maxX; i++) {
      map[i] = [];
    }

    for (let i = 0; i < maxX; i++) {
      for (let j = 0; j < maxY; j++) {
        let len = Math.abs(i - x) + Math.abs(j - y);
        this._myTimeOut(() => {
          this._show(i, j);
        }, len * 200);
      }
    }

  },
  /**
   * 该方法创建的setTimeOut都可以用 clearMyTimeOut全部清除
   * @param  {...any} arg setTimeOut的参数
   */
  _myTimeOut: function (...arg) {
    this._timeOutList.push(setTimeout.apply(window, arg));
    setTimeout(arg);
  },
  /**
   * 专门用来清除所有的 myTimeOut
   */
  _clearMyTimeOut: function () {
    for (let i in this._timeOutList) {
      let n = this._timeOutList[i];
      clearTimeout(n);
    }
  },
  /**
   * 返回游戏成功与否
   */
  _ifWin: function () {
    let x = this.sizeX;
    let y = this.sizeY;
    let unDisplayNum = 0;
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        if (!this._ifBtnDisplayed(i, j) || this._ifFlag(i, j)) {
          unDisplayNum++;
        }
      }
    }
    // console.log('undisplayedNum:' + unDisplayNum);
    return unDisplayNum == this.minesNum;
  },
  /**
   * 返回当前按钮处的值是否被显示了
   * @param {Number} x 当前按钮的坐标
   * @param {Number} y 当前按钮的坐标
   */
  _ifBtnDisplayed: function (x, y) {
    // let btn = this.getButton(x, y);
    return this.getBtnInnerHtml(x, y) !== this._icon.empty; // 通过内容判断
  },
  /**
   * 判断当前位置是否是旗子
   * @param {Number} x 坐标
   * @param {Number} y 
   */
  _ifFlag: function (x, y) {
    // let btn = this.getButton(x, y);
    return this.getBtnInnerHtml(x, y) === this._icon.flag; // 通过内容判断
  },
  /**
   * 游戏胜利
   */
  _victory: function () {
    this._stateTransition(this._allStates.success);
    this._victoryAnimation();
  },
  /**
   * 游戏胜利动画
   */
  _victoryAnimation: function () {
    for (let i = 0; i < this.sizeX; i++) {
      for (let j = 0; j < this.sizeY; j++) {
        if (!this._ifBtnDisplayed(i, j) || this._ifFlag(i, j)) {
          this.getButton(i, j).style.backgroundColor = this._btnColor.clear;
          // this.getButton(i, j).innerHTML = this._icon.clear;
          this.setBtnInnerHtml(i, j, this._icon.clear);
        }
      }
    }
  },
  /**
   * 返回周围 8 个节点
   * @param {Number} x 
   * @param {Number} y 
   */
  surroundNodes: function (x, y) {
    let result = [];
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        if (i === x && j === y) {
          continue;
        }
        if (i >= 0 && j >= 0 && i < this.sizeX && j < this.sizeY) {
          result.push([i, j]);
        }
      }
    }
    return result;
  },
  // /**
  //  * 返回 x, y 节点的相邻节点，上下左右共计四个
  //  * @param {Number} x 纵坐标
  //  * @param {Number} y 横坐标
  //  */
  // nearNode: function (x, y) {
  //   // 当前地图的尺寸
  //   let maxX = this.block.length;
  //   let maxY = this.block[0].length;

  //   let result = [];
  //   if (x > 0) {
  //     result.push([x - 1, y]);
  //   }
  //   if (y > 0) {
  //     result.push([x, y - 1]);
  //   }
  //   if (x < maxX - 1) {
  //     result.push([x + 1, y]);
  //   }
  //   if (y < maxY - 1) {
  //     result.push([x, y + 1]);
  //   }
  //   return result;
  // },
  // /**
  //  * 显示多个节点
  //  * @param {Array} arr 待显示的节点组合
  //  */
  // showNodes: function (arr) {
  //   console.log('showNodes')
  //   for (let i in arr) {
  //     let [x, y] = arr[i];
  //     this._show(x, y);
  //   }
  // },
  /**
   * 显示 x, y 处的节点
   * @param {Number} x 
   * @param {Number} y 
   */
  _show: function (x, y, tar = this.getButton(x, y)) {
    if (tar.localName !== 'button') {
      return;
    }
    // 获取 x, y 对应的节点
    switch (this.block[x][y]) {
      case this._mine:
        tar.style.backgroundColor = this._btnColor.mine;
        break;
        // case 0:
        //   tar.style.backgroundColor = this._btnColor.secure;
        //   tar.innerHTML = ' ';
        //   break;
      default:
        tar.style.backgroundColor = this._btnColor.secure;
        // tar.innerHTML = this._icon['num' + this.block[x][y]];
        this.setBtnInnerHtml(x, y, this._icon['num' + this.block[x][y]]);
    }
  },
  /**
   * 返回未显示的状态
   */
  _unshow: function (x, y, tar = this.getButton(x, y)) {
    if (tar.localName !== 'button') {
      return;
    }

    // tar.innerHTML = this._icon.empty;
    this.setBtnInnerHtml(x, y, this._icon.empty);
    tar.style.backgroundColor = this._btnColor.unshow;
  },
  /**
   * 显示旗子
   */
  _showFlag: function (x, y, tar = this.getButton(x, y)) {
    if (tar.localName !== 'button') {
      return;
    }

    // tar.innerHTML = this._icon.flag;
    this.setBtnInnerHtml(x, y, this._icon.flag);
    tar.style.backgroundColor = this._btnColor.flag;
  },
  /**
   * 获取 x, y 处的对象
   * @param {Number} x 行
   * @param {Number} y 列
   */
  getButton: function (x, y) {
    // 打表法优化
    if (!this._getBtn) {
      this._getBtn = [];
    }

    let btn = this._getBtn;
    if (!btn[x]) {
      btn[x] = [];
    }

    if (btn[x][y]) {
      return btn[x][y];
    }


    let root = this.getDomRoot();
    let table = root.getElementsByTagName("table")[0];
    let tr = table.getElementsByTagName('tr')[x];
    let td = tr.getElementsByTagName('td')[y];
    let target = td.getElementsByTagName('button')[0];

    btn[x][y] = target;

    return target;
  },

  // /**
  //  * 查看结构是否正确
  //  */
  // checkStructure:function(){
  //   let root = this.getDomRoot();
  //   let tds = root.childNodes;
  //   const block = this.block;
  //   if(tds.length !== block.length){
  //     return false;
  //   }else{
  //     for(let i=0;i<tds.length;i++){
  //       if(tds.length !== block[i].length){
  //         return false
  //       }
  //       let trs = tds.childNodes;
  //       console.log(trs[0].tag)
  //     }
  //   }
  // },
  /**
   * 获取旗子的数量
   */
  getFlagNum: function () {
    let s = 0;
    for (let i = 0; i < this.sizeX; i++) {
      for (let j = 0; j < this.sizeY; j++) {
        if (this._ifFlag(i, j)) {
          s++;
        }
      }
    }
    return s;
  },
  /**
   * 返回节点在兄弟节点中的序号，排行老几
   * @param {*} el 
   */
  indexOfList: function (el) {
    return Array.prototype.indexOf.call(el.parentElement.children, el);
  },
  /**
   * 获取 [x, y] 处的按钮中的文字
   * 并不是直接读取对应的文字
   * 而是读取上一次 setBtnInnerHtml中设置的值
   * 这是一个减少 DOM 操作的优化技巧（在优化了 getButton 后，这里是最大的性能瓶颈）
   * @param {Number} x 
   * @param {Number} y 
   */
  getBtnInnerHtml: function (x, y) {
    let html = this._innerHTML;
    if (html[x] && html[x][y] !== undefined) {
      return html[x][y];
    }
    return this._icon.empty;
  },
  /**
   * 设置 [x, y] 处的按钮中的文字
   * @param {Number} x 
   * @param {Number} y 
   */
  setBtnInnerHtml: function (x, y, innerHTML) {
    let btn = this.getButton(x, y);
    btn.innerHTML = innerHTML;
    let html = this._innerHTML;
    if (html[x] === undefined) {
      html[x] = [];
    }

    html[x][y] = innerHTML;
  },

  /**
   * 获取 button 在表格中的横纵位置
   * @param {Button} btn button 对象
   */
  getBtnIndex: function (btn) {
    // let btns = this._getBtn;
    // for (let i in btns) {
    //   for (let j in btns[i]) {
    //     if (btns[i][j] === btn) {
    //       return {
    //         x: i,
    //         y: j
    //       }
    //     }
    //   }
    // }

    let y = this.indexOfList(btn.parentElement);
    let x = this.indexOfList(btn.parentElement.parentElement);
    return {
      x,
      y,
    };
  }
}