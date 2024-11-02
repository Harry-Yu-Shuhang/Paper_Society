// pages/welcome/welcome.js
import { sendUserInfo, fetchWaterFallList, fetchHotRankList, fetchScoreRankList } from '../../utils/request';
import { appid, secret } from '../../utils/common_data';

const delayTime = 1500; // 延迟跳转时长

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
        if (res && res.data) {
          resolve(res.data); // 只返回响应数据
        } else {
          reject(new Error("Invalid response data"));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

// 预加载角色库和排行榜数据
async function preloadRankData() {
  try {
    // 预加载角色库数据
    const waterfallResponse = await fetchWaterFallList({ renderedIds: [] });
    if (waterfallResponse && waterfallResponse.data) {
      wx.setStorageSync('initialGirlsData', waterfallResponse.data);
    }

    // 预加载热度排行榜数据
    const hotRankResponse = await fetchHotRankList(0);
    // 预加载评分排行榜数据
    const scoreRankResponse = await fetchScoreRankList(0);

    if (hotRankResponse && hotRankResponse.idList && scoreRankResponse && scoreRankResponse.idList) {
      wx.setStorageSync('hotRankData', {
        idListCache: hotRankResponse.idList,
        fetchRankList: hotRankResponse.data,
        hasMoreData: hotRankResponse.hasMoreData
      });
      wx.setStorageSync('scoreRankData', {
        idListCache: scoreRankResponse.idList,
        fetchRankList: scoreRankResponse.data,
        hasMoreData: scoreRankResponse.hasMoreData
      });
    }
  } catch (error) {
    console.error("Failed to preload data:", error);
  }
}

Page({
  data: {
    userInfo: {
      userID: null,
      avatarUrl: "",
      cardCount: 0,
      isNewUser: false,
      isSameDay: false,
      nickName: "",
      openid: "",
    },
    hasUserInfo: false, // 是否已经有用户信息
  },

  onLoad() {
    const cachedUserInfo = wx.getStorageSync('userInfo');
    if (cachedUserInfo && cachedUserInfo.openid) {
      this.setData({
        userInfo: cachedUserInfo,
        hasUserInfo: true,
      });
      this.handleUserLogin();
    }
  },

  onShow() {
    // 每次页面显示时更新 userInfo 缓存
    if (this.data.userInfo.openid) {
      this.updateUserInfoCache();
    }
  },

  async updateUserInfoCache() {
    const { userInfo } = this.data;
    try {
      const response = await sendUserInfo(userInfo); // 请求后端获取最新的 userInfo
      if (response && typeof response === 'object') {
        userInfo.userID = response.userID || userInfo.userID;
        userInfo.cardCount = response.cardCount || userInfo.cardCount;
        userInfo.isNewUser = response.isNewUser || userInfo.isNewUser;
        userInfo.isSameDay = response.isSameDay || userInfo.isSameDay;
        wx.setStorageSync('userInfo', userInfo); // 更新缓存
        this.setData({ userInfo });
      } else {
        console.error("Invalid response structure:", response);
      }
    } catch (error) {
      console.error("Failed to update userInfo:", error);
    }
  },

  getUserProfile(event) {
    if (this.data.hasUserInfo) {
      this.handleUserLogin();
      return;
    }
    this.authorizeUser();
  },

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
        const openid = requestRes && requestRes.openid;
        if (openid) {
          userInfo.openid = openid;
          wx.setStorageSync('userInfo', userInfo);
          this.setData({ userInfo });
          this.handleUserLogin();
        } else {
          console.error("Failed to obtain openid from response:", requestRes);
        }
      }
    } catch (err) {
      if (err && err.errMsg && err.errMsg.includes('auth deny')) {
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

  async handleUserLogin() {
    const { userInfo } = this.data;
  
    try {
      const response = await sendUserInfo(userInfo);
      if (response && typeof response === 'object') {
        // 更新 userInfo 对象的属性而不重新赋值整个对象(因为userInfo是const)
        userInfo.userID = response.userID || userInfo.userID;
        userInfo.cardCount = response.cardCount ?? 0; // 如果未定义，默认为 0
        userInfo.isNewUser = response.isNewUser || userInfo.isNewUser;
        userInfo.isSameDay = response.isSameDay || userInfo.isSameDay;
        userInfo.nickName = response.nickName || userInfo.nickName;
        userInfo.avatarUrl = response.avatarUrl || userInfo.avatarUrl;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo });   
        // 调用预加载数据函数
        await preloadRankData();
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