import { fetchWaterFallList } from '../../utils/request';

const photo_step = 10;

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

async function fetchNewDataFromBackend() {
  try {
    const res = await fetchWaterFallList();
    return Array.isArray(res.data) ? res.data.slice(0, photo_step) : [];
  } catch (error) {
    console.error("Error fetching new data from backend:", error);
    return [];
  }
}

Page({
  data: {
    columns: [[], []],
    isLoading: false,
  },

  // 加载图片数据
  async loadData(showLoading = true) {
    if (this.data.isLoading) return;
  
    // 使用本次加载的唯一标志
    this.setData({ isLoading: showLoading });
  
    try {
      const newPics = await fetchNewDataFromBackend();
      if (newPics.length) {
        await this.renderPage(newPics);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      // 通过延时来确保状态更新更稳定
      setTimeout(() => {
        this.setData({ isLoading: false });
      }, 100); // 调整延时使状态更新稳定
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
    this.loadData(true); // 确保显示加载弹窗
  },
});