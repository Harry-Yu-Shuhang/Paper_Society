// pages/welcome/welcome.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, // 存储用户信息
    hasUserInfo: false, // 是否已经有用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // 页面首次加载时检查本地是否有缓存的用户信息
  onLoad() {
    const cachedUserInfo = wx.getStorageSync('userInfo');
    if (cachedUserInfo) {
      this.setData({
        userInfo: cachedUserInfo,
        hasUserInfo: true
      });

      // console.log(this.data.userInfo)

      // 展示"登录中"界面后延迟跳转
      setTimeout(() => {
        //带有选项卡的页面不能用redirectto
        wx.switchTab({
          url: '/pages/posts/posts',
        })
      },3000); // 延迟3000毫秒再跳转
    }
    
  },

   // 获取用户信息
   getUserProfile(event) {
    // 如果已经有用户信息，直接跳转页面
    if (this.data.hasUserInfo) {
      // 延迟跳转，延迟时间可以根据需求调整
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/posts/posts',
        });
      }, 3000); // 延迟跳转
      return;
    }

    // 如果没有用户信息，弹出微信授权的弹窗
    wx.getUserProfile({
      desc: '用于身份验证', // 说明获取用户信息的用途
      success: (res) => {
        //后台打印用户信息
        // console.log('用户信息：', res.userInfo);        
        // 将用户信息存储到本地缓存中
        wx.setStorageSync('userInfo', res.userInfo);
        // 更新页面的数据
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        // 跳转到另一个页面
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/posts/posts',
          });
        }, 1500); // 延迟跳转
        
      },
      fail: (err) => {
        // 未获取到权限，显示弹窗提示
        // console.log(err); // 打印错误信息，便于调试
        // 检查用户是拒绝还是取消授权，只有明确拒绝时才弹出提示
        if (err.errMsg.includes('auth deny') || err.errMsg.includes('auth denied')) {
          wx.showModal({
            title: '请授予权限',
            content: '没有身份证的人不可以去二次元哦!',
            showCancel: false, // 只显示确认按钮
            confirmText: '知道了'
          });
        }
      }
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
   * 生命周期函数--监听页面卸载，页面被销毁的时候显示出来
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

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