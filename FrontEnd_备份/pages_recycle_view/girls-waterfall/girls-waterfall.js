import {detailList} from "../../data/profiles"

const pics = detailList.map(item => ({
  id: item.id,
  girlSrc: `${item.girlSrc}`, // 图片路径
  name: item.name,          // 对应的 name
  views: item.views
}));

function getImageInfo(item) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: item.girlSrc,
      success(res) {
        const height = res.height * 750 / res.width
        resolve({ ...res,
          height,
          id: item.id,
          girlSrc:item.girlSrc,
          name: item.name,//添加name信息
          views:item.views
        })
      },
      fail(e) {
        console.error(e)
        resolve({
          type: 'error',
          height: 750,
          id: item.id,
          girlSrc:item.girlSrc,
          name: item.name,  // 添加 name 信息
          views:item.views
        })
      }
    })
  })
}

Page({
  // 不需要渲染到 wxml 的数据存储在 jsData 中
  jsData: {
    columnsHeight: [0, 0],
    isLoading: false,
  },
  data: {
    columns: [
      [],
      []
    ],
    tempPics: [],
    detailList: [],
    searchExist: false,
    searchResults: []
  },

  // 渲染到瀑布流
  renderPage: function(picList) {
    var that = this,
      columns = [[], []],  // 重置 columns，确保每次渲染时不会追加到旧数据上
      tempPics = that.data.tempPics,
      columnsHeight = [0, 0],  // 重置列高
      index = 0

    const batchPics = function() {
      let loadPicPs = []
      for(let i = 0; i < picList.length; i++) {
        loadPicPs.push(getImageInfo(picList[i]))
      }
      Promise.all(loadPicPs).then(results => {
        for (let i = 0; i < results.length; i++) {
          let res = results[i]
          index = columnsHeight[1] < columnsHeight[0] ? 1 : 0
          columns[index].push({
            id: res.id, 
            girlSrc: res.girlSrc, 
            name: res.name,
            views: res.views
          }) // 将 name 信息加入
          columnsHeight[index] += res.height
          // 输出当前两列的高度
          console.log(`第 ${i + 1} 张图片插入后，左列高度：${columnsHeight[0]}, 右列高度：${columnsHeight[1]}`);

        }
        that.setData({
          columns: columns
        })
        that.jsData.columnsHeight = columnsHeight
      })
    }

    batchPics()
  },

  // 加载数据
  loadData: function() {
    this.setData({
      detailList
    });

    var that = this
    if (!that.jsData.isLoading) {
      that.jsData.isLoading = true
      setTimeout(function() {
        that.renderPage(pics)
      }, 1000)
    }
  },

  // 搜索功能
  onSearch(event) {
    const query = event.detail.trim().toLowerCase(); // 获取搜索关键字并去除前后空格
    if (!query) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }
  
    const searchResults = detailList.filter(item => {
      return item.name.toLowerCase().includes(query); // 匹配名字中包含搜索关键字的
    });
  
    if (searchResults.length === 0) {
      wx.showToast({
        title: '未找到匹配项',
        icon: 'none'
      });
      return;
    }

    this.setData({
      searchExist: true,
      searchResults // 更新 searchResults 为搜索结果
    });

    this.renderPage(searchResults);
  },

  // 取消搜索
  onCancel(event) {
    this.setData({
      searchExist: false,
      searchResults: [] // 清空搜索结果
    });

    this.renderPage(pics);
  },

  onGoToDetail(event) {
    const gid = event.detail.gid
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid=' + gid,
    })
  },

  onLoad: function() {
    this.loadData()
  },

  onReady: function () {

  },

  onReachBottom: function() {
    this.loadData()
  },
})