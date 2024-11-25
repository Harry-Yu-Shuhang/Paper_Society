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
    computedCardText:'正在计算',
    computedHotText:'正在计算',
    userFavorites: [],
    favoritesCount: 0,
    isFail: false,
    failReason: '信号飞到三次元了',
    isSuccess:false,
    isLoading:false,
    isDescending: false, // 控制排序的布尔变量,默认新欢优先
    showGongzhonghao: false, // 控制弹窗显示
  },

  async getUserRanking() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo.userID : null;
  
    if (!userId) {
      console.error('用户未登录');
      throw new Error('用户未登录');
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
      throw error; // 继续向上抛出异常，以便外部捕获 
    }
  },

    /**
   * 切换排序顺序
   */
  toggleSortOrder() {
    this.setData({ isDescending: !this.data.isDescending });
    this.sortFavorites();
  },

  /**
   * 根据排序状态对收藏列表进行排序
   */
  sortFavorites() {
    const sortedFavorites = [...this.data.userFavorites];
    
    // 根据 isDescending 变量排序
    sortedFavorites.sort((a, b) => {
      if (this.data.isDescending) {
        return a.created_at - b.created_at; // 从旧到新
      } else {
        return b.created_at - a.created_at; // 从新到旧
      }
    });

    // 更新收藏列表
    this.setData({
      userFavorites: sortedFavorites
    });
  },

   /**
   * 获取用户收藏的角色
   */
  async loadUserFavorites() {
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo.userID : null;
    const userFavorites=wx.getStorageSync('userFavorites');
    let updatedFavoritesList=null;
  
    if (!userId) {
      console.error('用户未登录');
      return;
    }
    try {    
      if(!userFavorites){
      const response = await fetchUserFavorites(userId);
      const { favorites: favoritesList } = response;
      updatedFavoritesList = favoritesList.map(item => ({
        ...item,
        daysAgo: this.calculateDaysSince(item.created_at)
      }));
  
      // 根据排序状态排序
      updatedFavoritesList.sort((a, b) => {
        if (this.data.isDescending) {
          return a.created_at - b.created_at;
        } else {
          return b.created_at - a.created_at;
        }
      });
    }else{
      updatedFavoritesList = userFavorites.map(item => ({
        ...item,
        daysAgo: this.calculateDaysSince(item.created_at)
      }));
      // 根据排序状态排序
      updatedFavoritesList.sort((a, b) => {
        if (this.data.isDescending) {
          return a.created_at - b.created_at;
        } else {
          return b.created_at - a.created_at;
        }
      });
    }
  
      this.setData({
        userFavorites: updatedFavoritesList,
        favoritesCount: updatedFavoritesList.length
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

  /**
   * 处理收藏角色点击事件
   */
  onFavoriteTap(event) {
    // console.log("event是:",event)
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packageDetail/girl-detail/girl-detail?gid=${id}`,
    });
  },

  // 显示公众号弹窗
  onShowGongzhonghao() {
    this.setData({
      showGongzhonghao: true,
    });
  },

  // 关闭公众号弹窗
  closeGongzhonghaoWindow() {
    this.setData({
      showGongzhonghao: false,
    });
  },

  getCardText(cardPercent) {
    if (cardPercent <= 30) {
      return "家徒四壁";
    } else if (cardPercent > 30 && cardPercent <= 70) {
      return "丰衣足食";
    } else {
      return "腰缠万贯";
    }
  },

  getHotText(hotPercent) {
    if (hotPercent <= 30) {
      return "与世无争";
    } else if (hotPercent > 30 && hotPercent <= 70) {
      return "循序渐进"; 
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
  onShow() {
    // 从缓存中读取 userInfo
    const userInfo = wx.getStorageSync('userInfo');
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
    //从缓存读取收藏列表
    this.loadUserFavorites();

    // wx.setStorageSync('userFavorites',this.data.userFavorites);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onLoad() {
    // 获取用户排名数据
    this.getUserRanking();
    // 获取用户收藏列表
    this.loadUserFavorites();
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
  async onPullDownRefresh() {
    // 定义一个变量标记是否超时
    let isTimeout = false;
    // 启动超时计时器，5秒后设置超时状态
    const timeout = setTimeout(() => {
      isTimeout = true;
      this.setData({ 
        isLoading: false, 
        isFail: true,
        failReason:'信号似乎不大好喵', 
      });
      // 在 500ms 后清除成功或失败状态提示
      setTimeout(() => {
        this.setData({ isFail: false });
      }, 500);
      console.warn('刷新超时，停止请求响应');
    }, 5000); // 超时时间 5 秒
    try {
      // 停止下拉刷新动画
      wx.stopPullDownRefresh();
      this.setData({ isLoading: true });

      // this.onShow()代码
      const userInfo = wx.getStorageSync('userInfo');
      const { joinDateString, daysJoined } = this.calculateJoinDetails(userInfo.createTime);
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        userName: userInfo.nickName,
        daysJoined,
        joinDateString,
        cardCount: userInfo.cardCount,
        heatContribution: userInfo.userHot
      });
      // 加载用户排名信息
      await this.getUserRanking();
      // 加载用户收藏信息
      await this.loadUserFavorites();
      // 如果超时，直接退出
      if (isTimeout) return;
      // 清除计时器并更新成功状态
      clearTimeout(timeout);
      this.setData({ isSuccess: true, isLoading: false });
    } catch (error) {
      console.error('刷新失败:', error);
      // 清除计时器并设置失败状态
      clearTimeout(timeout);
      this.setData({ isFail: true, isLoading: false });
    }

    // 在 500ms 后清除成功或失败状态提示
    setTimeout(() => {
      this.setData({ isSuccess: false, isFail: false });
    }, 500);
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

  },

  // 监听 TabBar 切换事件
  onTabItemTap(item) {
    console.log(item)
    let hasSetname = wx.getStorageSync('hasSetName')
    if(hasSetname===false){
      wx.setStorageSync('hasSetName', true)
    }
  },
})