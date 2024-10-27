import { fetchHotRankList, fetchScoreRankList } from '../../utils/request';

const photo_step = 10;

Page({
  data: {
    loading: true,           // 初始为加载中
    fetchRankList: [],       // 当前排行榜数据
    activeTab: 'hotRank',    // 当前激活的标签，用于切换
  },

  // 获取排行榜数据
  async getRankList(rankType) {
    this.setData({ loading: true }); // 设置加载状态为 true

    try {
      const fetchRank = rankType === 'hotRank' ? fetchHotRankList : fetchScoreRankList;
      const response = await fetchRank();
      const rankList = response.data.slice(0, photo_step); // 获取前10条数据
      this.setData({
        fetchRankList: rankList,
        loading: false
      });
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
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getRankList(this.data.activeTab); // 下拉刷新时重新获取当前的排行榜数据
    wx.stopPullDownRefresh();              // 停止下拉刷新动画
  },
});