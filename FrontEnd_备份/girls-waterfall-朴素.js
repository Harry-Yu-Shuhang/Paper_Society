import { fetchWaterFallList } from '../../utils/request';

const photo_step = 10;

async function getImageInfo(item) {
  try {
    const res = await wx.getImageInfo({ src: item.girlSrc });
    const height = res.height * 750 / res.width;
    return {
      ...res,
      height,
      girl_id: item.girl_id,
      girlSrc: item.girlSrc,
      name: item.name,
      views: item.views
    };
  } catch (error) {
    console.error("Failed to get image info:", error);
    return {
      type: 'error',
      height: 750,
      girl_id: item.girl_id,
      girlSrc: item.girlSrc,
      name: item.name,
      views: item.views
    };
  }
}

async function fetchNewDataFromBackend() {
  try {
    const res = await fetchWaterFallList();
    const newPics = Array.isArray(res.data) ? res.data.slice(0, photo_step) : [];
    return newPics;
  } catch (error) {
    console.error("Error fetching new data from backend:", error);
    return [];
  }
}

Page({
  data: {
    columns: [[], []],
    isLoading: false,
    searchExist: false,
    searchResults: [],
  },

  // 加载图片数据
  async loadData(refresh = false) {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });
    const dataToRender = await fetchNewDataFromBackend();
    await this.renderPage(dataToRender);
    this.setData({ isLoading: false });
  },

  async renderPage(picList) {
    const columns = [[], []];
    const columnsHeight = [0, 0];
    const loadPicPromises = picList.map(pic => getImageInfo(pic));

    const results = await Promise.all(loadPicPromises);
    for (let res of results) {
      const index = columnsHeight[1] < columnsHeight[0] ? 1 : 0;
      columns[index].push({
        girl_id: res.girl_id,
        girlSrc: res.girlSrc,
        name: res.name,
        views: res.views
      });
      columnsHeight[index] += res.height;
    }

    this.setData({
      columns: columns,
      isLoading: false
    });
  },

  onGoToDetail(event) {
    const gid = event.detail.gid
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid=' + gid,
    })
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData(true);
    wx.stopPullDownRefresh();
  }
});