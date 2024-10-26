import { fetchWaterFallList } from '../../utils/request';

const CACHE_KEY = "cached_pics";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1天的缓存时间
const photo_step = 10;

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

function saveToCache(pics) {
  if (!pics || pics.length === 0) {
    console.warn("No pictures to cache.");
    return;
  }
  const cacheData = {
    timestamp: Date.now(),
    pics: pics.slice(0, photo_step)
  };
  console.log("Saving to cache:", cacheData);
  wx.setStorageSync(CACHE_KEY, cacheData);
}

function getFromCache() {
  const cacheData = wx.getStorageSync(CACHE_KEY);
  if (cacheData && cacheData.pics && cacheData.pics.length > 0) {
    console.log("Retrieved cache data:", cacheData);
    if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
      console.log("Using cached images.");
      return cacheData.pics;
    } else {
      console.log("Cache expired, fetching new data.");
    }
  } else {
    console.log("No cache data found or cache is empty, fetching new data.");
  }
  return null;
}

async function sendCachedDataToBackend(cachedData) {
  try {
    if (!cachedData || cachedData.length === 0) {
      console.log("Cache is empty. Requesting fresh data from backend.");
      return await fetchNewDataFromBackend();
    }
    console.log("Sending cached data to backend:", cachedData);
    await fetchWaterFallList();
    console.log("Sent cached data to backend successfully.");
    return cachedData;
  } catch (error) {
    console.error("Error sending cached data to backend:", error);
    return [];
  }
}

// 从后端获取新数据（缓存为空时）
async function fetchNewDataFromBackend() {
  try {
    const res = await fetchWaterFallList();
    
    // 确保从 `res` 中正确提取 `data` 数组
    const newPics = Array.isArray(res.data) ? res.data.slice(0, photo_step) : [];
    
    if (newPics.length === 0) {
      console.warn("Backend returned empty or invalid data.");
    } else {
      console.log("Fetched new data from backend:", newPics);
      saveToCache(newPics); // 将新数据保存到缓存
    }
    
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
    const cachedPics = getFromCache();
    let dataToRender = cachedPics && !refresh ? cachedPics : await sendCachedDataToBackend(cachedPics);
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
    saveToCache(picList);
  },

  onLoad() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData(true);
    wx.stopPullDownRefresh();
  }
});