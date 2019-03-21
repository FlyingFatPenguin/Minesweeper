// 创建一个扫雷模块
function Field(x, y, minesNum) {
  this.state = this._states.created;
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
  },
  /**
   * 初始化地图
   * @param {Number} x 场地宽带 
   * @param {Number} y 场地高度
   * @param {Number} minesNum 雷的数量
   */
  init: function (x, y, minesNum) {
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

    this.normalizedStructure();
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
  /**
   * 更新场景
   */
  updateField: function () {
    // 规范化结构
    this.normalizedStructure();

    // 更新数据

  },
  /**
   * 规范 dom 结构与 block 中的一致
   */
  normalizedStructure: function () {
    let root = this.getDomRoot();
    // 清空所有子节点
    root.innerHTML = '';
    let table = document.createElement('table');
    // let tbody = table.appendChild(document.createElement('tbody'));
    let tr = document.createElement('tr');
    for (let i = 0; i < this.block[0].length; i++) {
      let td = tr.appendChild(document.createElement('td'));
      let btn = td.appendChild(document.createElement('button'))
      // btn.innerHTML='';
    }
    for (let i = 0; i < this.block.length; i++) {
      table.appendChild(tr.cloneNode(true));
    }
    root.appendChild(table);

    // 为 table 设定监听器
    table.addEventListener('click', (event) => {
      // 获取最终点击的节点
      let tar = event.target;

      // 去除点击目标非 button 的情况
      if (!tar.localName === 'button') {
        return;
      }

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

    // 获取节点的x, y
    let y = this.indexOfList(tar.parentElement);
    let x = this.indexOfList(tar.parentElement.parentElement);
    console.log(x + ' ' + y);
    this.show(x, y, tar); // 设置 tar 避免查找，优化性能
    if(this.block[x][y] === this._mine){
      this.gameOver();
    }
  },
  gameOver: function () {
    this.stateTransition(this._states.finish);

    // 游戏结束动画
    setTimeout(() => {
      this.showMap();
      alert('Game Over!');
    }, 300);
  },
  /**
   * 显示整个地图
   */
  showMap: function (x=0,y=0) {
    // 实现中心扩散的动画效果
    let list0 = [];
    let list1 = [];
    while(list1.length>0){
      setTimeout(() => {
        showNodes(list1.slice(0));
      }, 200);
    }
  },
  /**
   * 显示 x, y 处的节点
   * @param {Number} x 
   * @param {Number} y 
   */
  show: function (x, y, tar = this.getButton(x, y)) {
    if(tar.localName !== 'button'){
      return;
    }
    // 获取 x, y 对应的节点
    switch (this.block[x][y]) {
      case this._mine:
        tar.style.backgroundColor = 'red';
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
  indexOfList: function (el) {
    return Array.prototype.indexOf.call(el.parentElement.children, el);
  }
}