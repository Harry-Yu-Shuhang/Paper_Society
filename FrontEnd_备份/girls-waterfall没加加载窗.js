import {detailList} from "../../data/profiles"

const pics = detailList.map(item => ({
  girl_id: item.girl_id,
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
          girl_id: item.girl_id,
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
          girl_id: item.girl_id,
          girlSrc:item.girlSrc,
          name: item.name,  // 添加 name 信息
          views:item.views
        })
      }
    })
  })
}

const Mode = "Batch"

Page({
  //不需要渲染到wxml的数据存储在jsData中
  jsData: {
    columnsHeight: [0, 0],
  },
  data: {
    columns: [
      [],
      []
    ],
    tempPics: [],
    detailList: [],
    searchExist:false,
    searchResults:[],
    isLoading: false,
  },


  //渲染到瀑布流
  renderPage: function(picList) {
    var that = this,
      data = that.data,
      // columns = data.columns,
      columns = [[], []],  // 重置columns，确保每次渲染时不会追加到旧数据上
      tempPics = data.tempPics,
      length = tempPics.length,
      // columnsHeight = that.jsData.columnsHeight,
      columnsHeight = [0, 0],  // 重置列高
      index = 0

    //获取所有图片信息以后一次加载，加载慢，渲染效果稍好
    const batchPics = function(){
      let loadPicPs = []
      for(let i=0;i<picList.length;i++){
        loadPicPs.push(getImageInfo(picList[i]))
      }
      Promise.all(loadPicPs).then(results => {
        for(let i=0;i<results.length;i++){
          let res = results[i]
          index = columnsHeight[1] < columnsHeight[0] ? 1 : 0
          columns[index].push({girl_id: res.girl_id, girlSrc: res.girlSrc, name: res.name,views:res.views}) // 将 name 信息加入
          columnsHeight[index] += res.height
        }
        that.setData({
          columns: columns,
        })
        that.jsData.columnsHeight = columnsHeight
        // wx.hideLoading()
      })
    }

    Mode == batchPics()
    // wx.hideLoading()
  },


  //加载数据
  loadData: function() {
    //改进:从json列表读取而非路径数组
    this.setData({
      detailList
    });

    //动态缓存
    this.setInitialRenderingCache({
      detailList
    })

    var that = this
    if (!that.jsData.isLoading) {
      // wx.showLoading()
      that.jsData.isLoading = true
      setTimeout(function() {
        that.renderPage(pics)
      }, 1000)
    }
  },

  onSearch(event) {
    const query = event.detail.trim().toLowerCase(); // 获取搜索关键字并去除前后空格
    if (!query) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }
  
    // 过滤 detailList 中的结果
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
    
    // 更新页面状态
    this.setData({
      searchExist: true,
      searchResults // 更新 searchResults 为搜索结果
    });

    // 调用 renderPage 渲染搜索结果
    this.renderPage(searchResults);
  },

  onCancel(event){
      // 更新页面状态为不显示搜索结果
    this.setData({
      searchExist: false,
      searchResults: [] // 清空搜索结果
    });
    
    // 重新渲染原始的 detailList 数据
    this.renderPage(pics);
  },

  onGoToDetail(event){
    const gid = event.detail.gid
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid='+gid,
    })
  },

  onLoad: function() {
    this.loadData()
  },
  onReachBottom: function() {
    this.loadData()
  },

})