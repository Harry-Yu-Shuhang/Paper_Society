import { detailList } from "../../data/profiles"

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
          girlSrc: item.girlSrc,
          name: item.name, // 添加 name 信息
          views: item.views
        })
      },
      fail(e) {
        console.error(e)
        resolve({
          type: 'error',
          height: 750,
          girl_id: item.girl_id,
          girlSrc: item.girlSrc,
          name: item.name,  // 添加 name 信息
          views: item.views
        })
      }
    })
  })
}

const Mode = "Batch"

Page({
  jsData: {
    columnsHeight: [0, 0],
    isLoading: false, // 将 isLoading 存储到 jsData 中
  },
  data: {
    columns: [
      [],
      []
    ],
    tempPics: [],
    detailList: [],
    searchExist: false,
    searchResults: [],
  },

  // 封装延迟加载函数
  delayRender: function(picList, renderDelay = 1500, hideDelay = 3500) {
    var that = this;
    this.setData({ isLoading: true }); // 通过 setData 更新 isLoading
    setTimeout(function() {
      that.renderPage(picList);
      // 加载完成后再延迟隐藏加载弹窗
      setTimeout(() => {
        that.setData({ isLoading: false }); // 使用 setData 隐藏加载弹窗
      }, hideDelay); // 设置延迟时间
    }, renderDelay); // 调整初始延迟时间
  },

  // 渲染到瀑布流
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
          columns: columns
        });
        that.jsData.columnsHeight = columnsHeight;
      });
    };
  
    Mode == batchPics();
  },

  // 加载数据
  loadData: function() {
    if (this.data.isLoading) return; // 避免重复加载
    this.setData({
      detailList,
      isLoading: true // 使用 setData 更新 isLoading
    }); 
    this.setInitialRenderingCache({ detailList });
    this.delayRender(pics,3000, 2000);
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
  
    this.setData({ isLoading: true });
  
    const searchResults = detailList.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  
    if (searchResults.length === 0) {
      wx.showToast({
        title: '未找到匹配项',
        icon: 'none'
      });
      this.setData({ isLoading: false });
      return;
    }
  
    this.setData({
      searchExist: true,
      searchResults
    });
  
    this.renderPage(searchResults);

    setTimeout(() => {
      this.setData({ isLoading: false });
    }, 500);
  },

  onCancel(event) {
    this.setData({
      searchExist: false,
      searchResults: [],
      isLoading: true
    });
    
    this.renderPage(pics);
    setTimeout(() => {
      this.setData({ isLoading: false });
    }, 3500);//延迟时间
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
  onReachBottom: function() {
    // this.loadData()
  },
})