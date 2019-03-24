// 创建一个扫雷模块
function Field(x, y, minesNum) {
  this.state = this._states.created;
  this._timeOutList = [];
}

Field.prototype = {
  _mine: -1, // 地雷
  _empty: 0, // 空地
  _states: { // 游戏状态
    created: 0, // 初始状态
    init: 1, // 创建完成 dom
    start: 2, // 可以开始游戏
    finish: 3, // 游戏结束
  },
  stateTransition: function (tarState) {
    this.state = tarState;

    // 设置回调
    let states = this._states;
    switch (tarState) {
      case states.init:
        this._clearMyTimeOut();
        this.runCallBack(this.whenInit);
        break;
      case states.finish:
        this.runCallBack(this.whenFinish);
        break;
      default:
        break;
    }
  },

  runCallBack: function (func, ...arg) {
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
    this.stateTransition(this._states.init);
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
      // btn.innerHTML='';
    }
    for (let i = 0; i < this.sizeX; i++) {
      table.appendChild(tr.cloneNode(true));
    }
    root.appendChild(table);

    // 为 table 设定监听器
    table.addEventListener('click', (event) => {
      // 获取最终点击的节点
      let tar = event.target;

      this.clickBtn(tar);
    }, false);
  },
  /**
   * 按钮被点击后的事件响应，变色及其他事件
   * @param {Button} tar 按钮
   */
  clickBtn: function (tar) {
    // 如果游戏终止了，就不再响应该事件
    if (this.state === this._states.finish) {
      return;
    }

    // 去除点击目标非 button 的情况
    if (!tar.localName === 'button') {
      return;
    }

    // 获取节点的x, y
    let y = this.indexOfList(tar.parentElement);
    let x = this.indexOfList(tar.parentElement.parentElement);
    // console.log(x + ' ' + y);

    // 如果点击目标已经被点击过了，就不再响应
    if (this._ifBtnDisplayed(x, y)) {
      return;
    }

    this._show(x, y, tar); // 设置 tar 避免查找，优化性能

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
        this.clickBtn(this.getButton(x, y));
      }
    }
  },
  /**
   * 游戏结束
   * 播放游戏结束动画，同时不再响应鼠标点击
   * @param {Number} x 结束动画的中心
   * @param {Number} y 
   */
  _gameOver: function (x = 0, y = 0) {
    this.stateTransition(this._states.finish);

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
    let maxX = this.block.length;
    let maxY = this.block[0].length;

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
        if (!this._ifBtnDisplayed(i, j)) {
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
    let btn = this.getButton(x, y);
    return btn.innerHTML !== ''; // 通过内容判断
  },
  /**
   * 游戏胜利
   */
  _victory: function () {
    this.stateTransition(this._states.finish);
    this._victoryAnimation();
  },
  /**
   * 游戏胜利动画
   */
  _victoryAnimation: function () {
    for (let i = 0; i < this.sizeX; i++) {
      for (let j = 0; j < this.sizeY; j++) {
        if (!this._ifBtnDisplayed(i, j)) {
          this.getButton(i, j).style.backgroundColor = 'green';
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
        tar.style.backgroundColor = 'red';
        break;
      case 0:
        tar.style.backgroundColor = 'white';
        tar.innerHTML = ' ';
        break;
      default:
        tar.style.backgroundColor = 'white';
        tar.innerHTML = this.block[x][y];
    }
  },
  /**
   * 获取 x, y 处的对象
   * @param {Number} x 行
   * @param {Number} y 列
   * TODO:
   * 使用数组直接保存对象，来避免查询
   */
  getButton: function (x, y) {
    let root = this.getDomRoot();
    let table = root.getElementsByTagName("table")[0];
    let tr = table.getElementsByTagName('tr')[x];
    let td = tr.getElementsByTagName('td')[y];
    let target = td.getElementsByTagName('button')[0];
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
   * 返回节点在兄弟节点中的序号，排行老几
   * @param {*} el 
   */
  indexOfList: function (el) {
    return Array.prototype.indexOf.call(el.parentElement.children, el);
  }
}