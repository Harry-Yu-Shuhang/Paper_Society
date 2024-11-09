// pages/user-profile/user-profile.js
import {fetchUserRanking, fetchUserFavorites} from '../../utils/request';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '', // 用于存储头像链接
    userName:'',
    joinDateString: null,
    daysJoined:null,
    cardCount:0,
    heatContribution:0,
    cardPercent:0,
    hotPercent:0,
    computedCardText:null,
    computedHotText:null,
    userFavorites: [],
    favoritesCount: 0,
    isFail: false,
    failReason: '信号飞到三次元了',
    isSuccess:false,
  },

  async getUserRanking() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo.userID : null;
  
    if (!userId) {
      console.error('用户未登录');
      return;
    }
  
    try {
      const response = await fetchUserRanking(userId);
  
      // 使用返回的数据更新页面
      const { cardPercent, hotPercent } = response;
      const computedCardText = this.getCardText(cardPercent);
      const computedHotText = this.getHotText(hotPercent);
  
      // 更新数据
      this.setData({
        cardPercent,
        hotPercent,
        computedCardText,
        computedHotText
      });
    } catch (error) {
      console.error('获取用户排名失败:', error);
      
    }
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
      // 一次性获取用户所有收藏的角色
      const response = await fetchUserFavorites(userId);
      const { favorites: favoritesList } = response;
      //console.log("favoritesList是:", favoritesList);
  
      // 计算每条收藏的天数
      const updatedFavoritesList = favoritesList.map(item => ({
        ...item,
        daysAgo: this.calculateDaysSince(item.created_at)
      }));
  
      // 更新收藏列表
      this.setData({
        userFavorites: updatedFavoritesList,
        favoritesCount: updatedFavoritesList.length,
      });
    } catch (error) {
      console.error('获取用户收藏失败:', error);
      this.setData({ isFail: true });
      setTimeout(() => this.setData({ isFail: false }), 800);
    }
  },

    /**
   * 处理收藏角色点击事件
   */
  onFavoriteTap(event) {
    console.log("event是:",event)
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packageDetail/girl-detail/girl-detail?gid=${id}`,
    });
  },

  getCardText(cardPercent) {
    if (cardPercent <= 30) {
      return "家徒四壁";
    } else if (cardPercent > 30 && cardPercent <= 70) {
      return "丰衣足食";
    } else {
      return "富可敌国";
    }
  },

  getHotText(hotPercent) {
    if (hotPercent <= 30) {
      return "与世无争";
    } else if (hotPercent > 30 && hotPercent <= 70) {
      return "稳中向好"; 
    } else {
      return "不遗余力";
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

  //计算用户加入到日期和天数
  calculateJoinDetails(createTime) {
    // 使用 calculateDaysSince 函数计算加入天数
    const daysJoined = this.calculateDaysSince(createTime) + 1; // 加 1 是因为当天也算 1 天

    // 将加入时间转换为日期格式
    const joinDate = new Date(createTime * 1000);
    const year = joinDate.getFullYear();
    const month = String(joinDate.getMonth() + 1).padStart(2, '0');
    const day = String(joinDate.getDate()).padStart(2, '0');
    const joinDateString = `${year}/${month}/${day}`;

    return { joinDateString, daysJoined };
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 从缓存中读取 userInfo
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 调用封装函数计算加入日期和天数
      const { joinDateString, daysJoined } = this.calculateJoinDetails(userInfo.createTime);
      // 设置数据
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        userName: userInfo.nickName,
        daysJoined,
        joinDateString,
        cardCount: userInfo.cardCount,
        heatContribution: userInfo.userHot
      });
      // 获取用户排名数据
      this.getUserRanking();
      // 获取用户收藏列表
      this.loadUserFavorites();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({ isSuccess: true });
    this.onLoad();
    wx.stopPullDownRefresh();
    setTimeout(() => this.setData({ isSuccess: false }), 500);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})