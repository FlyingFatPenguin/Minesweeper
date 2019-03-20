// 创建一个扫雷模块
function Field(x, y, minesNum) {}

Field.prototype = {
  _mine: -1, // 地雷
  _empty: 0, // 空地
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
    let table = document.createElement('table');
    // let tbody = table.appendChild(document.createElement('tbody'));
    let tr = document.createElement('tr');
    for (let i = 0; i < this.block[0].length; i++) {
      let td = tr.appendChild(document.createElement('td'));
      let btn = td.appendChild(document.createElement('button'))
      btn.innerHTML='hhh';
    }
    for (let i = 0; i < this.block.length; i++) {
      table.appendChild(tr.cloneNode(true));
    }
    root.appendChild(table);
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
}