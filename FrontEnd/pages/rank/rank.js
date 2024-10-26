import { fetchHotRankList, fetchScoreRankList } from '../../utils/request';

const CACHE_KEY_HOT = "hotRank_cache";
const CACHE_KEY_SCORE = "scoreRank_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1天的缓存时间

Page({
  data: {
    loading: true,           // 初始为加载中
    fetchRankList: [],       // 当前排行榜数据
    activeTab: 'hotRank',    // 当前激活的标签，用于切换
  },

  // 获取缓存中的排行榜数据
  getCache(rankType) {
    const cacheKey = rankType === 'hotRank' ? CACHE_KEY_HOT : CACHE_KEY_SCORE;
    const cacheData = wx.getStorageSync(cacheKey);
    if (cacheData && (Date.now() - cacheData.timestamp < CACHE_DURATION)) {
      console.log("Using cached rank data for:", rankType);
      return cacheData.data;
    }
    return null;
  },

  // 将排行榜数据存入缓存
  saveToCache(rankType, data) {
    const cacheKey = rankType === 'hotRank' ? CACHE_KEY_HOT : CACHE_KEY_SCORE;
    const cacheData = {
      timestamp: Date.now(),
      data: data.slice(0, 20) // 每次缓存前20条数据
    };
    wx.setStorageSync(cacheKey, cacheData);
  },

  // 获取排行榜数据
  async getRankList(rankType) {
    this.setData({ loading: true }); // 设置加载状态为 true

    // 先检查缓存数据
    const cachedData = this.getCache(rankType);
    if (cachedData) {
      this.setData({
        fetchRankList: cachedData,
        loading: false
      });
      return;
    }

    // 若缓存无效或不存在，则从云端获取数据
    try {
      const fetchRank = rankType === 'hotRank' ? fetchHotRankList : fetchScoreRankList;
      const response = await fetchRank();
      const rankList = response.data.slice(0, 20); // 获取前20条数据
      this.setData({
        fetchRankList: rankList,
        loading: false
      });
      this.saveToCache(rankType, rankList); // 保存数据到缓存
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
      this.setData({ loading: false });
    }
  },

  // Tab 切换时触发
  onClick(event) {
    const rankType = event.detail.name; // 获取点击的 tab 的 name 属性
    this.setData({ activeTab: rankType }); // 更新当前激活的 tab
    this.getRankList(rankType);            // 请求对应的排行榜数据
  },

  // 页面加载时获取默认的排行榜数据
  onLoad() {
    this.getRankList('hotRank'); // 默认加载人气榜数据

    wx.getSavedFileList({
      success(res) {
        console.log("Cached files:", res.fileList);
        res.fileList.forEach(file => {
          console.log(`File path: ${file.filePath}`);
          console.log(`File size: ${file.size} bytes`);
          console.log(`File creation time: ${new Date(file.createTime * 1000)}`);
        });
      },
      fail(err) {
        console.error("Failed to get saved file list:", err);
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getRankList(this.data.activeTab); // 下拉刷新时重新获取当前的排行榜数据
    wx.stopPullDownRefresh();              // 停止下拉刷新动画
  },

  // 其他生命周期方法和事件处理函数...
});