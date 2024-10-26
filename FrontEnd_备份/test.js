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
    isLoading: true,
  },


  //渲染到瀑布流
  renderPage: function(picList) {
    var that = this,
      columns = [[], []],
      columnsHeight = [0, 0],
      index = 0;
  
    const batchPics = function() {
      let loadPicPs = [];
      for (let i = 0; i < picList.length; i++) {
        loadPicPs.push(getImageInfo(picList[i]));
      }
      Promise.all(loadPicPs).then(results => {
        for (let i = 0; i < results.length; i++) {
          let res = results[i];
          index = columnsHeight[1] < columnsHeight[0] ? 1 : 0;
          columns[index].push({
            girl_id: res.girl_id,
            girlSrc: res.girlSrc,
            name: res.name,
            views: res.views
          });
          columnsHeight[index] += res.height;
        }
        that.setData({
          columns: columns,
          isLoading: false // 渲染完成后隐藏加载弹窗
        });
        that.jsData.columnsHeight = columnsHeight;
      });
    };
  
    Mode == batchPics();
  },


  //加载数据
  loadData: function() {
    // 如果已经在加载中则直接返回，避免重复显示加载弹窗
    if (this.jsData.isLoading) return;
  
    // 设置加载状态为 true 显示 loading-window
    this.setData({
      isLoading: true,
      detailList
    });
    
    // 动态缓存
    this.setInitialRenderingCache({
      detailList
    });
  
    var that = this;
    that.jsData.isLoading = true; // 标记为加载状态
    setTimeout(function() {
      that.renderPage(pics);
      // 加载完成后再延迟隐藏 loading-window
      setTimeout(() => {
        that.setData({ isLoading: false });
        that.jsData.isLoading = false; // 重置加载状态
      }, 3500); // 设置延迟时间，可根据需求调整
    }, 1500); // 调整初始延迟时间
  },
  

  onSearch(event) {
    const query = event.detail.trim().toLowerCase();
    if (!query) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }
  
    this.setData({ isLoading: true }); // 开始搜索时显示加载弹窗
  
    const searchResults = detailList.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  
    if (searchResults.length === 0) {
      wx.showToast({
        title: '未找到匹配项',
        icon: 'none'
      });
      this.setData({ isLoading: false }); // 搜索完成，隐藏加载弹窗
      return;
    }
  
    this.setData({
      searchExist: true,
      searchResults
    });
  
    // 渲染搜索结果
    this.renderPage(searchResults);

    // 搜索结果渲染完成后延迟隐藏 loading-window
    setTimeout(() => {
      this.setData({ isLoading: false });
    }, 500); // 这里的延迟时间也可以根据需求调整
  },

  onCancel(event) {
    this.setData({
      searchExist: false,
      searchResults: [],
      isLoading: true // 显示加载弹窗
    });
    
    this.renderPage(pics);
    // 加载完成后延迟隐藏加载弹窗
    setTimeout(() => {
      this.setData({ isLoading: false });
    }, 500); // 这里的延迟时间也可以根据需求调整
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
    //this.loadData()
  },

})
看一下这个代码
可不可以把这部分封装成一个函数复用
    setTimeout(function() {
      that.renderPage(pics);
      // 加载完成后再延迟隐藏 loading-window
      setTimeout(() => {
        that.setData({ isLoading: false });
        that.jsData.isLoading = false; // 重置加载状态
      }, 3500); // 设置延迟时间，可根据需求调整
    }, 1500); // 调整初始延迟时间
同时我注意到isLoading好像是存储在data中，不是jsdata中，这些也修改一下