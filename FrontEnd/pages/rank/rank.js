import { fetchHotRankList, fetchScoreRankList, fetchScoreRankListByIds, fetchHotRankListByIds, fetchGirlDetail, fetchWaterFallList, fetchUserFavorites, sendUserInfo } from '../../utils/request';
let rankType = 'hotRank';

// 预加载角色库数据
async function preloadRankData() {
  try {
    // 预加载角色库数据
    const waterfallResponse = await fetchWaterFallList({ renderedIds: [] });
    if (waterfallResponse && waterfallResponse.data) {
      wx.setStorageSync('initialGirlsData', waterfallResponse.data);
    }
    
  } catch (error) {
    console.error("Failed to preload data:", error);
  }
}

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
    isLoading:false,
    showNewUserModal: false,  // 是否显示新用户弹窗
    showDailySignModal: false, // 是否显示签到弹窗
    windowAvatar: "/images/Paper_Society.jpg",         // 新用户头像
    showGuideModal:false,
    showArrowOverlay: false, // 是否显示箭头遮罩层
    isNewUser:false,
    showCallModal:false,
    // userName:"新用户"
  },

  async fetchRankData(rankType, offset = 0, isRefresh = false) {
    // 定义一个变量标记是否超时
    let isTimeout = false;
    // 启动超时计时器，5秒后设置超时状态
    const timeout = setTimeout(() => {
      isTimeout = true;
      if (isRefresh) {
        this.setData({ 
          isLoading: false, 
          isFail: true,
          failReason:'信号似乎不大好喵', 
        });
        setTimeout(() => this.setData({ isFail: false }), 500);
      }
      console.warn('刷新超时，停止请求响应');
    }, 5000); // 超时时间 5 秒
    try {
      if (offset === 0 && !isRefresh && this.data.fetchRankList.length > 0) return; // 避免重复请求
  
      if (isRefresh) {
        this.setData({ 
          hasMoreData: true,
          isLoading: true
        });
      }
  
      // 根据 rankType 获取相应的排行榜数据
      const response = rankType === 'hotRank' ? await fetchHotRankList(offset) : await fetchScoreRankList(offset);
      // 如果超时，直接退出，不处理响应结果
      if (isTimeout) return;
  
      const { data: newRankList, hasMoreData, idList } = response;
  
      if (isRefresh || offset === 0) {
        this.setData({
          idListCache: idList, // 缓存ID列表
          fetchRankList: newRankList,
          currentCount: newRankList.length,
          hasMoreData,
        });
  
        // 根据 rankType 缓存 ID 列表到本地存储
        const cacheKey = rankType === 'hotRank' ? 'hotRankData' : 'scoreRankData';
        wx.setStorageSync(cacheKey, {
          idListCache: idList,
          fetchRankList: newRankList,
          hasMoreData,
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
        this.setData({ 
          isSuccess: true, 
          isLoading: false 
        });
        setTimeout(() => this.setData({ isSuccess: false }), 500);
      }
      setTimeout(() => this.setData({ loading: false }), 800);
      clearTimeout(timeout); // 如果请求失败，也需要清除计时器
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
      clearTimeout(timeout); // 如果请求失败，也需要清除计时器
      this.setData({ 
        loading: false, 
        isFail: true, 
        isLoading: false 
      });
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
      const nextBatchIds = this.data.idListCache.slice(offset, offset + 100);//一次获取100个
  
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
        // 如果缓存存在，直接加载缓存数据
        this.setData({
            activeTab: rankType,
            idListCache: cachedData.idListCache,
            fetchRankList: cachedData.fetchRankList,
            currentCount: cachedData.fetchRankList.length,
            hasMoreData: cachedData.hasMoreData,
            loading: false, // 关闭骨架屏
        });
    } else {
        // 如果缓存不存在，显示骨架屏并加载数据
        this.setData({
            activeTab: rankType,
            currentCount: 0,
            fetchRankList: [],
            loading: true, // 显示骨架屏
        });

        this.fetchRankData(rankType).then(() => {
            this.setData({ loading: false }); // 数据加载完成后关闭骨架屏
        });
    }
  },

  // 计算用户收藏的天数
  calculateDaysSince(createdAt) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTime = Math.floor(currentDate.getTime() / 1000);

    const recordDate = new Date(createdAt * 1000);
    recordDate.setHours(0, 0, 0, 0);
    const recordTime = Math.floor(recordDate.getTime() / 1000);

    // 计算从收藏到现在的天数
    const daysAgo = Math.floor((currentTime - recordTime) / (60 * 60 * 24));
    return daysAgo;
  },

     /**
   * 获取用户收藏的角色
   */
  async loadUserFavorites() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo.userID : null;
  
    if (!userId) {
      console.error('用户未登录');
      return;
    }
  
    try {
      const response = await fetchUserFavorites(userId);
      const { favorites: favoritesList } = response;
      const updatedFavoritesList = favoritesList.map(item => ({
        ...item,
        daysAgo: this.calculateDaysSince(item.created_at)
      }));
  
      // 根据排序状态排序
      updatedFavoritesList.sort((a, b) => {
        // if (this.data.isDescending) {
        //   return a.created_at - b.created_at;
        // } else {
          return b.created_at - a.created_at;
        // }
      });

      //收藏夹存入缓存
      wx.setStorageSync('userFavorites',updatedFavoritesList);
    } catch (error) {
      console.error('获取用户收藏失败:', error);
      this.setData({ isFail: true });
      setTimeout(() => this.setData({ isFail: false }), 800);
      throw error; // 继续向上抛出异常，以便外部捕获
    }
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo'); // 获取缓存中的用户信息
    const invitationData = wx.getStorageSync('invitationData'); // 获取邀请信息

    if(!userInfo.createTime){
      wx.redirectTo({
        url: '/pages/welcome/welcome',
      })
      return;
    }
  
    // 判断是否显示新用户弹窗或签到弹窗
    if (userInfo) {
      if (userInfo.isNewUser) {
        this.setData({
          showNewUserModal: true,
          isNewUser: true,
        });
        userInfo.isNewUser = false;
        wx.setStorageSync('userInfo', userInfo);
      } else if (!userInfo.isSameDay) {
        this.setData({ showDailySignModal: true });
        userInfo.isSameDay = true;
        wx.setStorageSync('userInfo', userInfo);
      }else if (invitationData) {// 如果存在 invitationData，显示去打call弹窗
        this.setData({
          showCallModal: true, // 显示 "去打call" 弹窗
          callModalData: {
            inviter: invitationData.inviter,
            character: invitationData.character,
            gid: invitationData.gid,
          },
        });
      }
    }
  
    
  
    // 加载排行榜数据或缓存
    const hotRankCache = wx.getStorageSync('hotRankData');
    const initialGirlsCache = wx.getStorageSync('initialGirlsData');
    const userFavorites = wx.getStorageSync('userFavorites');
  
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
  
    if (!initialGirlsCache) {
      preloadRankData();
    }
    if (!userFavorites) {
      this.loadUserFavorites();
    }
  },

    // 关闭新用户弹窗,显示签到弹窗
    closeNewUserModal() {
      this.setData({ 
          showNewUserModal: false,
          showDailySignModal:true,
       });
    },
  
    // 关闭每日签到弹窗
    closeDailySignModal() {
      this.setData({ showDailySignModal: false });
      const invitationData = wx.getStorageSync('invitationData'); // 获取邀请信息
      if(invitationData){
        this.setData({
          showCallModal: true, // 显示 "去打call" 弹窗
          callModalData: {
            inviter: invitationData.inviter,
            character: invitationData.character,
            gid: invitationData.gid,
          },
        });
      }else if(this.data.isNewUser===true){
        this.setData({ 
          showGuideModal: true, // 显示引导弹窗
          isNewUser:false,
        });
      }
    },

  async onPullDownRefresh() {
    wx.stopPullDownRefresh();
    this.setData({isLoading:true})
    this.fetchRankData(this.data.activeTab, 0, true);
    // 获取缓存中的 `detailData` 和 `userInfo`
    const detailData = wx.getStorageSync('detailData');
    const userInfo = wx.getStorageSync('userInfo');
    try {
      // 通过缓存中的 `ID` 和 `userID` 发送请求更新详情数据
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
        failReason: '信号飞到三次元了',
        isLoading:false,
      });
      setTimeout(() => {
        this.setData({ isFail: false });
      }, 800);
    } 
  },

  closeGuideModal() {
    this.setData({ 
      showGuideModal: false,
      showArrowOverlay: true // 显示箭头
     });
     wx.setStorageSync('hasSetName', false)
  },

  async onShow(){
    let hasSetName = wx.getStorageSync('hasSetName')
    //console.log("hasSetName:",hasSetName)
    if(hasSetName===true){
      this.setData({ 
        showArrowOverlay: false // 隐藏箭头
      });
    }

    //新增：每次onshow都更新每日签到状态
    const userInfo = wx.getStorageSync('userInfo');
    try {
      const response = await sendUserInfo(userInfo);
      if (response && typeof response === 'object') {
        // 只更新 isSameDay字段，保留其他字段
        if (response.isSameDay !== undefined) {
          userInfo.isSameDay = response.isSameDay;
        }
        wx.setStorageSync('userInfo', userInfo);
      } else {
        console.error("Invalid response structure:", response);
      }
    } catch (error) {
      console.error('请求失败:', error);
    }
    if (!userInfo.isSameDay && !userInfo.isNewUser) {
      this.setData({ showDailySignModal: true });
      userInfo.isSameDay = true;
      wx.setStorageSync('userInfo', userInfo);
    }
  },

    /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const userInfo=wx.getStorageSync('userInfo')
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          userName: 'gh_e0b65c8a9341',  
          path: '/pages/welcome/welcome', // 分享路径，必须以 / 开头
          withShareTicket: true,
          miniprogramType: 0,
          title: userInfo.nickName+'邀请你加入纸片社',
        })
      }, 2000)
    })
    return {
      userName: 'gh_e0b65c8a9341',  
      path: '/pages/welcome/welcome', // 分享路径，必须以 / 开头
      withShareTicket: true,
      miniprogramType: 0,
      title: userInfo.nickName+'邀请你加入纸片社',
      promise 
    }

  },
  onShareTimeline(){
    return {
      title: '加入纸片社，一起为你最爱的二次元老婆们发电吧～(っ●ω●)っ',
      // query: {
      //   key: value
      // },
      // imageUrl: ''
    }
  },
    // 前往角色页面
    goToCall() {
      // const { gid } = this.data.callModalData;
      const invitationData=wx.getStorageSync('invitationData');
      const gid = invitationData.gid
      // 前往指定角色页面
      wx.navigateTo({
        url: `/packageDetail/girl-detail/girl-detail?gid=${gid}`,
      });
  
      // 关闭弹窗
      this.setData({ showCallModal: false });
  
      // 清除缓存中的 invitationData
      wx.removeStorageSync('invitationData');
    },
  
    // 关闭去打call弹窗
    closeCallModal() {
      this.setData({ showCallModal: false });
  
      // 清除缓存中的 invitationData
      wx.removeStorageSync('invitationData');
  
      // 显示引导弹窗
      if (this.data.isNewUser) {
        this.setData({
          showGuideModal: true,
        });
      }
    },
});