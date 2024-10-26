// pages/welcome/welcome.js
import { sendUserInfo } from '../../utils/request.js';
import { appid, secret } from '../../utils/common_data';

const delayTime = 1500; // 延迟跳转时长

Page({
  data: {
    userInfo: {
      avatarUrl:"",
      cardCount:0,
      isNewUser:false,
      isSameDay:false,
      nickName:"",
      openid:"",
    }, // 存储用户信息，包括 openid
    hasUserInfo: false, // 是否已经有用户信息
  },

  // 页面首次加载时检查本地是否有缓存的用户信息
  onLoad() {
    const cachedUserInfo = wx.getStorageSync('userInfo');
    if (cachedUserInfo && cachedUserInfo.openid) {
      this.setData({
        userInfo: cachedUserInfo,
        hasUserInfo: true,
      });
      this.handleUserLogin(); // 调用封装的登录处理函数
    }
  },

  // 获取用户信息
  getUserProfile(event) {
    if (this.data.hasUserInfo) {
      this.handleUserLogin(); // 如果已经有用户信息，直接调用封装的登录处理函数
      return;
    }
    this.authorizeUser(); // 调用封装的权限验证和登录函数
  },

  // 封装的权限验证和登录函数
  authorizeUser() {
    wx.getUserProfile({
      desc: '用于身份验证',
      success: (res) => {
        const { nickName, avatarUrl } = res.userInfo;
        const userInfo = { nickName, avatarUrl };
        this.setData({
          userInfo,
          hasUserInfo: true,
        });

        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              let URL = 'https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code=' + loginRes.code + '&grant_type=authorization_code';

              wx.request({
                url: URL,
                method: 'POST',
                success: (response) => {
                  const openid = response.data.openid;
                  userInfo.openid = openid;
                  wx.setStorageSync('userInfo', userInfo); // 缓存初始 userInfo
                  this.setData({ userInfo });
                  this.handleUserLogin();
                },
                fail: (error) => {
                  console.error('获取 openid 失败:', error);
                },
              });
            }
          },
        });
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny') || err.errMsg.includes('auth denied')) {
          wx.showModal({
            title: '请授予权限',
            content: '没身份不可以去二次元哦!',
            showCancel: false,
            confirmText: '知道了',
          });
        }
      },
    });
  },

  // 封装发送用户数据和跳转逻辑
  handleUserLogin() {
    const { userInfo } = this.data;

    // 发送用户信息和 openid 给后端
    sendUserInfo(userInfo)
      .then((response) => {
        // console.log('后端返回的数据:', response);

        // 将 后端返回的数据添加到 userInfo，并缓存
        userInfo.cardCount = response.cardCount;
        userInfo.isNewUser = response.isNewUser;
        userInfo.isSameDay = response.isSameDay;
        wx.setStorageSync('userInfo', userInfo); // 更新缓存

        // 更新页面数据
        this.setData({ userInfo });
      })
      .catch((error) => {
        console.error('请求失败:', error);
      });

    // 延迟跳转到排行榜页面
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/rank/rank',
      });
    }, delayTime);
  }
});