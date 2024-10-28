import { fetchWaterFallList, fetchSearchList } from '../../utils/request';

const photo_step = 10;
const load_err_time = 1500;
const load_fail_show = 2000;
const default_fail_reason = '信号飞到三次元了'
let load_finish_wait = 1000;
let success_wait = 1500;

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

    if (isRefresh) {
      // 如果是下拉刷新操作，清空当前数据,并且重新请求后端
      //this.setData({ columns: [[], []], renderedIds: [] }); // 重置渲染数据
      this.setData({ renderedIds: [] })//先只重置renderids
    }
    this.setData({ isLoading: showLoading });
    try {
      const newPics = await this.fetchNewDataFromBackend();
      //console.log("newPics是:",newPics)
      if (newPics.length) {
        if (isRefresh) {
          this.setData({ columns: [[], []] })//重置columns，这样如果失败了也不清空页面上已经渲染的数据
        }
        await this.renderPage(newPics);
        // 更新渲染过的数据ID
        const newIds = newPics.map(pic => pic.id);
        this.setData({ renderedIds: [...this.data.renderedIds, ...newIds] });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  },

  async fetchNewDataFromBackend() {
    this.setData({ isLoading: true });
    try {
      const res = await fetchWaterFallList({ renderedIds: this.data.renderedIds }); // 传递已渲染的ID列表

      // 检查返回的数据是否为空
      if (Array.isArray(res.data) && res.data.length === 0) {
        // 如果没有更多数据，设置一个标志并关闭加载状态
        setTimeout(() => {
          this.setData({
            isLoading: false,
            isFail: true,  // 用于表示没有更多数据的标志
            failReason:"没有更多数据喵!",
          });
        }, 1000);

        setTimeout(() => {
          this.setData({ 
            isFail: false,
            failReason:default_fail_reason,
           });
        }, 2000);
        
        return []; // 返回空数组，表示没有新数据
      }
      return Array.isArray(res.data) ? res.data.slice(0, photo_step) : [];
    } catch (error) {
      console.error("Error fetching new data from backend:", error);
      setTimeout(() => {
        this.setData({ isLoading: false, isFail: true });
      }, load_err_time);
      setTimeout(() => {
        this.setData({ isFail: false });
      }, load_fail_show);
      return [];
    }
  },
  
  async renderPage(picList, isSearch = false) {
    const { columns } = this.data;
    const columnsHeight = columns.map(col => col.reduce((sum, pic) => sum + pic.height, 0));

    const results = await Promise.all(picList.map(pic => getImageInfo(pic)));
    results.forEach(res => {
      const index = columnsHeight[0] <= columnsHeight[1] ? 0 : 1;
      columns[index].push(res);
      columnsHeight[index] += res.height;
    });

    this.setData({ columns });
    if(!isSearch){
    // 关闭加载弹窗,显示成功弹窗
      setTimeout(() => {
          this.setData({isLoading:false});
          this.setData({isSuccess:true});
        }, load_finish_wait);
      setTimeout(() => {
        this.setData({isSuccess:false});
      }, success_wait);
    }
    else{
      setTimeout(() => {
        this.setData({isSuccess:false});
      }, 500);//搜索模式降低延迟
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
        await this.renderPage(res.data, true);
      } else {
        this.setData({ isFail: true, failReason: "没有找到匹配的结果" });
        setTimeout(() => this.setData({ isFail: false, failReason: default_fail_reason }), 2000);
      }
    } catch (error) {
      console.error("搜索失败:", error);
      this.setData({ isFail: true, failReason: "搜索失败，请稍后重试" });
      setTimeout(() => this.setData({ isFail: false, failReason: default_fail_reason }), 2000);
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
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid=' + event.detail.gid,
    });
  },

  onLoad() {
    this.loadData();
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