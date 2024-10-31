import { fetchWaterFallList, fetchSearchList } from '../../utils/request';

const photo_step = 10;
const default_fail_reason = '信号飞到三次元了'

async function getImageInfo(item) {
  try {
    const res = await wx.getImageInfo({ src: item.girlSrc });
    const height = res.height * 750 / res.width;
    return { ...item, ...res, height };
  } catch (error) {
    console.error("Failed to get image info:", error);
    return { ...item, height: 750, type: 'error' };
  }
}

Page({
  data: {
    columns: [[], []],
    isLoading: false,
    isFail: false,
    isSuccess: false,
    renderedIds: [], // 新增：用于存储已渲染的ID列表
    failReason: default_fail_reason,//失败原因，默认信号不好
    value: '',  // 搜索关键词
    searchExist: false,  // 搜索结果是否存在
    backupColumns: null, // 用于存储搜索前的 columns 数据
  },

  async loadData(showLoading = true, isRefresh = false) {
    if (this.data.isLoading) return;
  
    // 设置加载状态
    this.setData({ isLoading: showLoading });
  
    // 设置 5 秒定时器，强制重置加载状态
    const loadingTimeout = setTimeout(() => {
      if (this.data.isLoading) {
        this.setData({ isLoading: false });
        console.warn("Data loading took too long. Forcing isLoading to false.");
        this.setData({isFail:true, failReason:'信号似乎不大好喵'})
        setTimeout(() => {
          this.setData({isFail:false})
        },800)
      }
    }, 4000); // 4 秒
  
    if (isRefresh) {
      // 如果是下拉刷新操作，清空当前数据,并且重新请求后端
      this.setData({ renderedIds: [] });
    }
  
    try {
      const newPics = await this.fetchNewDataFromBackend();
      if (newPics.length) {
        if (isRefresh) {
          this.setData({ columns: [[], []] }); // 重置 columns，这样如果失败了也不清空页面上已经渲染的数据
        }
        await this.renderPage(newPics);
  
        // 更新渲染过的数据ID
        const newIds = newPics.map(pic => pic.id);
        this.setData({ renderedIds: [...this.data.renderedIds, ...newIds] });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      clearTimeout(loadingTimeout); // 清除定时器
      this.setData({ isLoading: false }); // 确保在加载完成后设置 isLoading 为 false
    }
  },

  async fetchNewDataFromBackend() {
    this.setData({ isLoading: true });
    try {
      const res = await fetchWaterFallList({ renderedIds: this.data.renderedIds }); // 传递已渲染的ID列表

      // 检查返回的数据是否为空
      if (Array.isArray(res.data) && res.data.length === 0) {
        this.setData({ isLoading: false });
        // 如果没有更多数据，设置一个标志并关闭加载状态
        setTimeout(() => {
          this.setData({
            isFail: true,  // 用于表示没有更多数据的标志
            failReason:"没有更多数据喵!",
          });
        }, 0);

        setTimeout(() => {
          this.setData({ 
            isFail: false,
            failReason:default_fail_reason,
           });
        }, 800);
        
        return []; // 返回空数组，表示没有新数据
      }
      return Array.isArray(res.data) ? res.data.slice(0, photo_step) : [];
    } catch (error) {
      console.error("Error fetching new data from backend:", error);
      this.setData({ isLoading: false });
      setTimeout(() => {
        this.setData({ isFail: true });
      }, 500);
      setTimeout(() => {
        this.setData({ isFail: false });
      }, 1200);
      return [];
    }
  },
  
  async renderPage(picList, isFirst=false) {
    const { columns } = this.data;
    const columnsHeight = columns.map(col => col.reduce((sum, pic) => sum + pic.height, 0));

    const results = await Promise.all(picList.map(pic => getImageInfo(pic)));
    results.forEach(res => {
      const index = columnsHeight[0] <= columnsHeight[1] ? 0 : 1;
      columns[index].push(res);
      columnsHeight[index] += res.height;
    });

    this.setData({ columns });
    this.setData({isLoading:false});
    if(!isFirst){
      this.setData({isSuccess:true});
      setTimeout(() => {
        this.setData({isSuccess:false});
      }, 600);
    }
  },

  async searchData(keyword) {
    if (!this.data.backupColumns) {
      this.setData({ backupColumns: this.data.columns }); // 仅在第一次搜索时备份
    }
    
    this.setData({ isLoading: true });
    try {
      const res = await fetchSearchList(keyword);
      if (res.data.length) {
        this.setData({ columns: [[], []], searchExist: true }); // 重置列并标记有搜索结果
        await this.renderPage(res.data);
      } else {
        this.setData({ isFail: true, failReason: "没有找到匹配的结果" });
        setTimeout(() => this.setData({ isFail: false, failReason: default_fail_reason }), 800);
      }
    } catch (error) {
      console.error("搜索失败:", error);
      this.setData({ isFail: true, failReason: "搜索失败，请稍后重试" });
      setTimeout(() => this.setData({ isFail: false, failReason: default_fail_reason }), 800);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 处理搜索事件
  onSearch(event) {
    const keyword = event.detail; // 获取搜索关键词
    this.searchData(keyword);
  },

  onCancel() {
    this.setData({
      value: '',
      columns: this.data.backupColumns || [[], []], // 恢复备份数据
      searchExist: false,
      renderedIds: this.data.backupColumns ? this.data.renderedIds : [], // 若有备份则保持 renderedIds，不再请求
    });
  },

  onClear() {
    this.setData({
      value: '',
      columns: this.data.backupColumns || [[], []], // 恢复备份数据
      searchExist: false,
      renderedIds: this.data.backupColumns ? this.data.renderedIds : [], // 若有备份则保持 renderedIds，不再请求
    });
  },

  onGoToDetail(event) {
    //console.log("event.detail是:",event.detail)
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid=' + event.detail.gid,
    });
  },

  onLoad() {
    // 检查缓存中是否有初始数据
    const initialData = wx.getStorageSync('initialGirlsData');
    if (initialData && initialData.length) {
      // 从缓存数据中提取已渲染的 ID，并将其存储到 renderedIds
      const initialRenderedIds = initialData.map(item => item.id);
      this.setData({ renderedIds: initialRenderedIds });
      this.renderPage(initialData, true);
    } else {
      this.loadData(); // 如果没有缓存数据则执行正常加载流程
    }
  },

  // 触底时触发请求下一组数据
  onReachBottom() {
    this.loadData(); 
  },

  onPullDownRefresh(){
    wx.stopPullDownRefresh()
    this.loadData(true,true);
  },

   /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});