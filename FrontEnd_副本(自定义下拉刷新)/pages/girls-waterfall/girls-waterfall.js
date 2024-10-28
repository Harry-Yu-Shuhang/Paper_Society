import { fetchWaterFallList } from '../../utils/request';

const photo_step = 10;
const load_err_time = 2000;
const load_finish_wait = 600;
const signal_err_text = '信号飞到三次元了'

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

// async function fetchNewDataFromBackend() {
//   this.setData({ isLoading: true });
//   try {
//     const res = await fetchWaterFallList();
//     return Array.isArray(res.data) ? res.data.slice(0, photo_step) : [];
//   } catch (error) {
//     console.error("Error fetching new data from backend:", error);
//     // 2秒后执行代码
//     setTimeout(() => {
//       this.setData({ isLoading: false });
//       wx.showToast({
//         title: signal_err_text,
//       })
//     }, load_err_time);
//     return [];
//   }
// }

Page({
  data: {
    columns: [[], []],
    isLoading: false,
  },
  async loadData(showLoading = true) {
    if (this.data.isLoading) return;
  
    // 使用本次加载的唯一标志
    this.setData({ isLoading: showLoading });
  
    try {
      const newPics = await this.fetchNewDataFromBackend();
      if (newPics.length) {
        await this.renderPage(newPics);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {

    }
  },

  // 从后端取数据
  async fetchNewDataFromBackend() {
    this.setData({ isLoading: true });
    try {
      const res = await fetchWaterFallList();
      return Array.isArray(res.data) ? res.data.slice(0, photo_step) : [];
    } catch (error) {
      console.error("Error fetching new data from backend:", error);
      setTimeout(() => {
        this.setData({ isLoading: false });
        wx.showToast({
          title: signal_err_text,
        });
      }, load_err_time);
      return [];
    }
  },

  // 渲染图片
  async renderPage(picList) {
    const { columns } = this.data;
    const columnsHeight = columns.map(col => col.reduce((sum, pic) => sum + pic.height, 0));

    const results = await Promise.all(picList.map(pic => getImageInfo(pic)));
    results.forEach(res => {
      const index = columnsHeight[0] <= columnsHeight[1] ? 0 : 1;
      columns[index].push(res);
      columnsHeight[index] += res.height;
    });

    this.setData({ columns });
    // 在800毫秒后关闭加载弹窗
    setTimeout(() => {
      this.setData({isLoading:false});
    }, load_finish_wait);
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

  //onPullDownRefresh(){
    // wx.showNavigationBarLoading()
    // this.loadData();
    // wx.hideNavigationBarLoading()
  //},

   /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});