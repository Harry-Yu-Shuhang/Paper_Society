import { fetchHotRankList, fetchScoreRankList } from '../../utils/request';
let rankType = 'hotRank';

Page({
  data: {
    loading: true,
    fetchRankList: [],
    activeTab: 'hotRank',
    currentCount: 0,
    hasMoreData: true,
    isFail:false,
    failReason:'信号飞到三次元了',
    isSuccess:false,
  },

  // 修改 fetchRankData 函数
  async fetchRankData(rankType, offset = 0, isRefresh = false) {
    try {
      if (isRefresh) {
        this.setData({ 
          loading: true,
          hasMoreData: true,
        });
      }

      // 根据 rankType 调用对应的函数
      const response = rankType === 'hotRank' ? 
        await fetchHotRankList(offset) : await fetchScoreRankList(offset);
      
      const { data: newRankList, hasMoreData } = response;

      this.setData({
        fetchRankList: offset === 0 ? newRankList : [...this.data.fetchRankList, ...newRankList],
        currentCount: offset + newRankList.length,
        loading: false,
        hasMoreData,
      });

      if (isRefresh) {
        this.setData({ isSuccess: true });
        setTimeout(() => {
          this.setData({ isSuccess: false });
        }, 500);
      }
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
      this.setData({ loading: false });
      
      // 加载失败，则不清空数据
      this.setData({ isFail: true });
      setTimeout(() => {
        this.setData({ isFail: false });
      }, 800);
    }
  },
  
  onClick(event) {
    rankType = event.detail.name;
    this.setData({ activeTab: rankType, currentCount: 0, fetchRankList: [], isRefresh:true });
    this.fetchRankData(rankType);
  },

  onRankTap(event) {
    const id = event.currentTarget.dataset.id; // 获取点击的项的 id
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid=' + id,
    });
  },

  onLoad() {
    this.fetchRankData(rankType);
  },

  onReachBottom() {
    if (this.data.hasMoreData) {
      this.fetchRankData(this.data.activeTab, this.data.currentCount);
    }else{
      this.setData({
        isFail: true,  
        failReason:"没有更多数据喵!",
      });
      setTimeout(() => {
        this.setData({
          isFail: false, 
        });
      }, 600);
    }
  },

  onPullDownRefresh() {
    this.fetchRankData(this.data.activeTab, 0, true);
    wx.stopPullDownRefresh();
  },
});