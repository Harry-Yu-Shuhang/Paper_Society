// import { detailList } from "../../data/profiles";
import {baseURL, girls_profile_waterfall} from '../../utils/common_data'
import {fetchWaterFallList} from '../../utils/request';

const CACHE_KEY = "cached_pics";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1天的缓存时间

// 获取图片信息并缓存
async function getImageInfo(item) {
  try {
    console.log(`Fetching image info for item: ${item.name}`);
    const res = await wx.getImageInfo({ src: item.girlSrc });
    const height = res.height * 750 / res.width;
    console.log(`Fetched image info for ${item.name}: `, res);
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

// 保存图片信息到缓存
function saveToCache(pics) {
  const cacheData = {
    timestamp: Date.now(),
    pics: pics.slice(0, 20) // 每次缓存20张图片
  };
  console.log("Saving to cache:", cacheData);
  wx.setStorageSync(CACHE_KEY, cacheData);
}

// 从缓存中获取图片信息
function getFromCache() {
  const cacheData = wx.getStorageSync(CACHE_KEY);
  if (cacheData) {
    console.log("Retrieved cache data:", cacheData);
    if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
      console.log("Using cached images.");
      return cacheData.pics;
    } else {
      console.log("Cache expired, fetching new data.");
    }
  } else {
    console.log("No cache data found, fetching new data.");
  }
  return null;
}

// 发送缓存的20条数据的详情给后端
async function sendCachedDataToBackend(cachedData) {
  try {
    console.log("Sending cached data to backend:", cachedData);
    await wx.request({
      url: baseURL + girls_profile_waterfall, // 替换为你的后端URL
      method: 'POST',
      data: JSON.stringify(cachedData),
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log("Sent cached data to backend successfully:", res.data);
      },
      fail(err) {
        console.error("Failed to send cached data to backend:", err);
      }
    });
  } catch (error) {
    console.error("Error sending cached data to backend:", error);
  }
}

Page({
  data: {
    columns: [[], []],
    isLoading: false,
    searchExist: false,
    searchResults: [],
  },

  // 渲染页面数据
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
    saveToCache(picList); // 保存数据到缓存
  },

  // 加载图片数据
  async loadData(refresh = false) {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });
    const cachedPics = getFromCache();

    if (cachedPics && !refresh) {
      // 使用缓存数据渲染页面
      console.log("Rendering cached data...");
      await this.renderPage(cachedPics);
      await sendCachedDataToBackend(cachedPics); // 将缓存数据发送给后端
    } else {
      // 从后端获取数据，不再进行随机排序
      console.log("Fetching new data from backend...");
      const newPics = await this.fetchNewDataFromBackend();
      await this.renderPage(newPics);
    }
  },

  // 从后端获取新数据（不排序，排序在后端完成）
  async fetchNewDataFromBackend() {
    try {
      const res = await wx.request({
        url: 'https://your-backend-url.com/api/get_images', // 替换为你的后端URL
        method: 'GET',
      });
      const newPics = res.data.slice(0, 20);
      console.log("Fetched new data from backend:", newPics);
      return newPics;
    } catch (error) {
      console.error("Error fetching new data from backend:", error);
      return [];
    }
  },

  // 搜索功能
  onSearch(event) {
    const query = event.detail.trim().toLowerCase();
    if (!query) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' });
      return;
    }

    this.setData({ isLoading: true });
    const searchResults = fetchWaterFallList.filter(item => item.name.toLowerCase().includes(query));
  
    if (searchResults.length === 0) {
      wx.showToast({ title: '未找到匹配项', icon: 'none' });
      this.setData({ isLoading: false });
      return;
    }

    console.log("Search results:", searchResults);
    this.setData({
      searchExist: true,
      searchResults
    });

    this.renderPage(searchResults);
  },

  // 取消搜索
  onCancel() {
    this.setData({
      searchExist: false,
      searchResults: [],
      isLoading: true
    });
    this.renderPage(pics);
  },

  // 跳转到详情页
  onGoToDetail(event) {
    const gid = event.detail.gid;
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid=' + gid,
    });
  },

  // 页面加载
  onLoad() {
    this.loadData();
  },

  // 下拉刷新，手动触发重新从云端获取数据
  onPullDownRefresh() {
    this.loadData(true);
    wx.stopPullDownRefresh();
  }
});