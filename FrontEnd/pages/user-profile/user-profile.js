// pages/user-profile/user-profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '', // 用于存储头像链接
    userName:'',
    joinDateString: null,
    daysJoined:null,
    cardCount:null,
    heatContribution:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() { // 改变参数名为 `query`，避免冲突
    // 从缓存中读取 userInfo
    const userInfo = wx.getStorageSync('userInfo');
      // 获取当前时间的 Unix 时间戳（秒级）
      const currentTime = Math.floor(Date.now() / 1000);
      // 计算加入的天数
      const daysJoined = Math.floor((currentTime - userInfo.createTime) / (60 * 60 * 24)+1);
      // 将 createTime 转换为日期格式
      const joinDate = new Date(userInfo.createTime * 1000);
      const year = joinDate.getFullYear();
      const month = String(joinDate.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
      const day = String(joinDate.getDate()).padStart(2, '0');
      const joinDateString = `${year}/${month}/${day}`; // 输出：2024/11/01
      // 设置数据
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        userName: userInfo.nickName,
        daysJoined,
        joinDateString,
        cardCount:userInfo.cardCount,
        heatContribution:userInfo.userHot
      });

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
    wx.stopPullDownRefresh();
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