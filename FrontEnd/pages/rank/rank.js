import { fetchHotRankList, fetchScoreRankList, fetchScoreRankListByIds, fetchHotRankListByIds, fetchGirlDetail } from '../../utils/request';
let rankType = 'hotRank';

Page({
  data: {
    loading: true,
    fetchRankList: [],
    activeTab: 'hotRank',
    currentCount: 0,
    hasMoreData: true,
    idListCache: [],  // 缓存的ID列表
    isFail: false,
    failReason: '信号飞到三次元了',
    isSuccess: false,
  },

  async fetchRankData(rankType, offset = 0, isRefresh = false) {
    try {
      if (offset === 0 && !isRefresh && this.data.fetchRankList.length > 0) return; // 避免重复请求
      
      if (isRefresh) {
        this.setData({ hasMoreData: true });
      }

      // 根据 rankType 获取相应的排行榜数据
      const response = rankType === 'hotRank' ? 
        await fetchHotRankList(offset) : await fetchScoreRankList(offset);

      const { data: newRankList, hasMoreData, idList } = response;

      if (isRefresh || offset === 0) {
        this.setData({
          idListCache: idList,  // 缓存ID列表
          fetchRankList: newRankList,
          currentCount: newRankList.length,
          hasMoreData,
        });
        
        // 根据 rankType 缓存 ID 列表到本地存储
        const cacheKey = rankType === 'hotRank' ? 'hotRankData' : 'scoreRankData';
        wx.setStorageSync(cacheKey, {
          idListCache: idList,
          fetchRankList: newRankList,
          hasMoreData
        });
      } else {
        this.setData({
          fetchRankList: [...this.data.fetchRankList, ...newRankList],
          currentCount: offset + newRankList.length,
          loading: false,
          hasMoreData,
        });
      }

      if (isRefresh) {
        this.setData({ isSuccess: true });
        setTimeout(() => this.setData({ isSuccess: false }), 500);
      }

      setTimeout(() => this.setData({ loading: false }), 800);
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
      this.setData({ loading: false, isFail: true });
      setTimeout(() => this.setData({ isFail: false }), 800);
    }
  },

  onRankTap(event) {
    const id = event.currentTarget.dataset.id; // 获取点击的项的 id
    wx.navigateTo({
      url: '/packageDetail/girl-detail/girl-detail?gid=' + id,
    });
  },

  // 触底加载更多数据时，从缓存ID列表中获取下一组ID
  async onReachBottom() {
    try {
      // Calculate offset and the next batch of IDs
      const offset = this.data.currentCount;
      const nextBatchIds = this.data.idListCache.slice(offset, offset + 30);
  
      // Check if nextBatchIds is a valid array
      if (!Array.isArray(nextBatchIds) || nextBatchIds.length === 0) {
        this.setData({
          hasMoreData: false,
          isFail: true,
          failReason: "没有更多数据喵!",
        });
        setTimeout(() => {
          this.setData({ isFail: false });
        }, 600);
      }
  
      // Fetch the next batch of data from the backend
      const response = this.data.activeTab === 'hotRank'
        ? await fetchHotRankListByIds(nextBatchIds, offset)
        : await fetchScoreRankListByIds(nextBatchIds, offset);
  
      const { data: newRankList, hasMoreData } = response;
  
      // Merge new data and update `currentCount`
      this.setData({
        fetchRankList: [...this.data.fetchRankList, ...newRankList],
        currentCount: offset + newRankList.length,
        hasMoreData: hasMoreData !== undefined ? hasMoreData : nextBatchIds.length > 0,
      });
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
      this.setData({
        isFail: true,
        failReason: "信号飞到三次元了",
      });
      setTimeout(() => {
        this.setData({ isFail: false });
      }, 800);
    }
  },

  // 切换榜单
  onClick(event) {
    rankType = event.detail.name;
    const cacheKey = rankType === 'hotRank' ? 'hotRankData' : 'scoreRankData';
    const cachedData = wx.getStorageSync(cacheKey);

    if (cachedData && cachedData.idListCache) {
      this.setData({
        activeTab: rankType,
        idListCache: cachedData.idListCache,
        fetchRankList: cachedData.fetchRankList,
        currentCount: cachedData.fetchRankList.length,
        hasMoreData: cachedData.hasMoreData,
        loading: false,
      });
    } else {
      this.setData({ activeTab: rankType, currentCount: 0, fetchRankList: [], isRefresh: true });
      this.fetchRankData(rankType);
    }
  },

  onLoad() {
        // 预加载热度排行榜
        const hotRankCache = wx.getStorageSync('hotRankData');
        const scoreRankCache = wx.getStorageSync('scoreRankData');
        
        if (hotRankCache && hotRankCache.idListCache) {
          this.setData({
            idListCache: hotRankCache.idListCache,
            fetchRankList: hotRankCache.fetchRankList,
            currentCount: hotRankCache.fetchRankList.length,
            hasMoreData: hotRankCache.hasMoreData,
            loading: false,
          });
        } else {
          this.fetchRankData('hotRank');
        }
    
        // 预加载评分排行榜数据以便切换时无需再次加载
        if (!scoreRankCache) {
          this.fetchRankData('scoreRank');
        }
  },

  async onPullDownRefresh() {
    this.fetchRankData(this.data.activeTab, 0, true);
    // 获取缓存中的 `detailData` 和 `userInfo`
    const detailData = wx.getStorageSync('detailData');
    const userInfo = wx.getStorageSync('userInfo');

    if (detailData) {
      try {
        // 通过缓存中的 `ID` 和 z`userID` 发送请求更新详情数据
        const updatedDetail = await fetchGirlDetail(detailData.ID, userInfo.userID);

        // 更新缓存和页面数据
        wx.setStorageSync('detailData', updatedDetail.data);
        this.setData({
          detailData: updatedDetail,
        });
      } catch (error) {
        console.error("刷新失败:", error);
        this.setData({
          isFail: true,
          failReason: '刷新详情数据失败，请稍后重试',
        });
        setTimeout(() => {
          this.setData({ isFail: false });
        }, 800);
      } 
    } else {
      console.log("缓存里没有角色数据，不需要更新");
    }
      wx.stopPullDownRefresh();
    },
});