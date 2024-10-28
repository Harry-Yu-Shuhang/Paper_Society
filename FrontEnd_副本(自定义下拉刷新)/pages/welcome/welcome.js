// pages/welcome/welcome.js
import { sendUserInfo } from '../../utils/request.js';
import { appid, secret } from '../../utils/common_data';

const delayTime = 1500; // 延迟跳转时长

// 封装 wx.request 为 Promise
// 封装 wx.request 为 Promise
function requestPromise(url, method, data = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        // 检查 res 是否存在以及 data 是否为有效对象
        if (res && res.data) {
          resolve(res.data); // 只返回响应数据
        } else {
          reject(new Error("Invalid response data")); // 否则返回错误
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

Page({
  data: {
    userInfo: {
      avatarUrl: "",
      cardCount: 0,
      isNewUser: false,
      isSameDay: false,
      nickName: "",
      openid: "",
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
    // 封装的权限验证和登录函数
  async authorizeUser() {
    try {
      const profileRes = await wx.getUserProfile({ desc: '用于身份验证' });
      const { nickName, avatarUrl } = profileRes.userInfo;
      const userInfo = { nickName, avatarUrl };
      this.setData({
        userInfo,
        hasUserInfo: true,
      });

      const loginRes = await wx.login();
      if (loginRes.code) {
        const URL = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${loginRes.code}&grant_type=authorization_code`;
        const requestRes = await requestPromise(URL, 'POST');

        // 确保 requestRes 是一个对象并且包含 openid 字段
        const openid = requestRes && requestRes.openid;
        if (openid) {
          userInfo.openid = openid;
          wx.setStorageSync('userInfo', userInfo); // 缓存初始 userInfo
          this.setData({ userInfo });
          this.handleUserLogin();
        } else {
          console.error("Failed to obtain openid from response:", requestRes);
        }
      }
    } catch (err) {
      if (err && err.errMsg && typeof err.errMsg === 'string' && err.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '请授予权限',
          content: '没身份不可以去二次元哦!',
          showCancel: false,
          confirmText: '知道了',
        });
      } else {
        console.error('授权失败:', err);
      }
    }
  },
  

  // 封装发送用户数据和跳转逻辑
  async handleUserLogin() {
    const { userInfo } = this.data;
  
    try {
      // 发送用户信息和 openid 给后端
      const response = await sendUserInfo(userInfo);
      
      if (response && typeof response === 'object') {
        // 将后端返回的数据添加到 userInfo，并缓存
        userInfo.cardCount = response.cardCount || 0;
        userInfo.isNewUser = response.isNewUser || false;
        userInfo.isSameDay = response.isSameDay || false;
        wx.setStorageSync('userInfo', userInfo); // 更新缓存
  
        // 更新页面数据
        this.setData({ userInfo });
      } else {
        console.error("Invalid response structure:", response);
      }
    } catch (error) {
      console.error('请求失败:', error);
    }
  
    // 延迟跳转到排行榜页面
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/rank/rank',
      });
    }, delayTime);
  },
});