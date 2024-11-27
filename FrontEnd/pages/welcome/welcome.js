// pages/welcome/welcome.js
import { sendUserInfo, fetchWaterFallList, fetchUserInfo} from '../../utils/request';
import { baseURL } from '../../utils/common_data';

const delayTime = 1500; // 延迟跳转时长

// 封装 wx.request 为 Promise
// function requestPromise(url, method, data = {}) {
//   return new Promise((resolve, reject) => {
//     wx.request({
//       url,
//       method,
//       data,
//       header: {
//         'Content-Type': 'application/json'
//       },
//       success: (res) => {
//         if (res && res.data) {
//           resolve(res.data); // 只返回响应数据
//         } else {
//           reject(new Error("Invalid response data"));
//         }
//       },
//       fail: (error) => {
//         reject(error);
//       }
//     });
//   });
// }

// 预加载角色库数据
// async function preloadRankData() {
//   try {
//     // 预加载角色库数据
//     const waterfallResponse = await fetchWaterFallList({ renderedIds: [] });
//     if (waterfallResponse && waterfallResponse.data) {
//       wx.setStorageSync('initialGirlsData', waterfallResponse.data);
//     }
    
//   } catch (error) {
//     console.error("Failed to preload data:", error);
//   }
// }

Page({
  data: {
    userInfo: {
      userID: null,
      avatarUrl: "",
      cardCount: 0,
      isNewUser: false,
      isSameDay: false,
      nickName: "",
      openID: "",
      userHot : 0,
      createTime:0,
    },
    hasUserInfo: false, // 是否已经有用户信息
  },

  async onLoad(options) {
    const { inviter, character, gid } = options;
    if (inviter && character && gid) {
      console.log(inviter,character,gid)
      // 将邀请信息存入缓存
      const invitationData = {
        inviter,
        character,
        gid: Number(gid), // 转换为数字存储
      };
      wx.setStorageSync('invitationData', invitationData);
      console.log('邀请信息已存储:', invitationData);
    }



    let userInfo = wx.getStorageSync('userInfo') || {}; // 获取缓存中的 userInfo 或初始化为空对象
    // 确保 userInfo 是对象
    if (typeof userInfo !== 'object' || userInfo === null) {
      userInfo = {};
    }
    // console.log("userInfo是",userInfo)
    // 如果 openid 不存在，获取最新的用户信息
    if (!userInfo.openID || userInfo.openID==="") {
      try {
        const result = await wx.cloud.callContainer({
          config: {
            env: 'prod-4guz1brc55a6d768', // 替换为云托管环境ID
          },
          path: '/api/getOpenID', // 替换为后端路由路径
          method: 'GET',
          header: {
            'X-WX-SERVICE': 'golang-5kg8', // 替换为云托管服务的名称
          },
        });
    
        if (result?.data?.openID) {
          userInfo.openID = result.data.openID; // 更新或添加 openid 字段
          wx.setStorageSync('userInfo', userInfo); // 保留其他字段并更新缓存
          this.setData({ userInfo });
        } else {
          console.error('Failed to fetch openid:', result);
          wx.showModal({
            title: 'Error',
            content: '获取 openid 失败，请检查云托管配置。',
            showCancel: false,
          });
        }
      } catch (error) {
        console.error('获取 OpenID 失败:', error);
        wx.showModal({
          title: '登陆失败',
          content: '请检查网络或稍后重试。',
          showCancel: false,
        });
        this.setData({hasUserInfo:false})
      }
    }
    // 如果 openid 存在，获取最新的用户信息
    if (userInfo.openID) {
      try {
        const freshUserInfo = await fetchUserInfo(userInfo.openID);
        if (!freshUserInfo.error) {
          // 更新 userInfo 中的字段，仅更新 freshUserInfo 中存在的字段
          const updatedUserInfo = { ...userInfo }; // 保留原有字段
          Object.keys(freshUserInfo).forEach((key) => {
            updatedUserInfo[key] = freshUserInfo[key]; // 更新字段
          });
          // 更新到页面数据
          this.setData({
            userInfo: updatedUserInfo,
            hasUserInfo: true,
          });
          this.handleUserLogin();
        }else{
          //新用户
          //let newCache = userInfo
          // console.log("newCache是",newCache)
          // 清空所有缓存
          wx.clearStorageSync();
          const updatedUserInfo = { openID: userInfo.openID }; // 仅保留 openID
          wx.setStorageSync('userInfo', updatedUserInfo);
          this.setData({
            userInfo:updatedUserInfo,
          })
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        this.setData({hasUserInfo:false})
        wx.showModal({
          title: "获取用户信息失败",
          content: "请检查网络连接或稍后重试。",
          showCancel: false,
        });
      }
    }
  },

  onShow() {
    // 每次页面显示时更新 userInfo 缓存
    // if (this.data.userInfo.openid) {
    //   this.updateUserInfoCache();
    // }
  },

  // async updateUserInfoCache() {
  //   const { userInfo } = this.data;
  //   try {
  //     const response = await sendUserInfo(userInfo); // 请求后端获取最新的 userInfo
  //     if (response && typeof response === 'object') {
  //       userInfo.userID = response.userID;
  //       userInfo.cardCount = response.cardCount;
  //       userInfo.isNewUser = response.isNewUser;
  //       userInfo.isSameDay = response.isSameDay;
  //       userInfo.createTime = response.createTime;
  //       wx.setStorageSync('userInfo', userInfo); // 更新缓存
  //       this.setData({ userInfo });
  //     } else {
  //       console.error("Invalid response structure:", response);
  //     }

  //   } catch (error) {
  //     console.error("Failed to update userInfo:", error);
  //   }
  // },

  getUserProfile(event) {
    // if (this.data.hasUserInfo) {
    //   this.handleUserLogin();
    // }else{
    //this.authorizeUser();
    //}
    if (!this.data.hasUserInfo) {
      this.authorizeUser();
    }
  },

  async authorizeUser() {
    try {
      const userInfo = this.data.userInfo || {};
      // if (userInfo.isNewUser===true){
        userInfo.nickName = "新用户";
        this.setData({
          hasUserInfo:true,
          userInfo,
        });
        const profileRes = await wx.getUserProfile({ desc: '用于身份验证' });
        const { nickName, avatarUrl } = profileRes.userInfo;
        userInfo.avatarUrl = avatarUrl;
        this.setData({
          userInfo,
        })
      //}
      // 处理登录逻辑
      this.handleUserLogin();
    } catch (err) {
      console.error('授权失败:', err);
      wx.showModal({
        title: '请授予权限',
        content: '没身份不可以去二次元哦!',
        showCancel: false,
      });
    }
  },


  async handleUserLogin() {
    const { userInfo } = this.data;
    try {
      const response = await sendUserInfo(userInfo);
      if (response && typeof response === 'object') {
        // console.log("userInfo是:",userInfo)
        // console.log("response是:",response)
        // 更新 userInfo 对象的属性而不重新赋值整个对象(因为userInfo是const)
        userInfo.userID = response.userID || userInfo.userID;
        userInfo.cardCount = response.cardCount ?? 0; // 如果未定义，默认为 0
        userInfo.isNewUser = response.isNewUser !== undefined ? response.isNewUser : userInfo.isNewUser;
        userInfo.isSameDay = response.isSameDay !== undefined ? response.isSameDay : userInfo.isSameDay;
        userInfo.nickName = response.nickName || userInfo.nickName;
        userInfo.avatarUrl = response.avatarUrl || userInfo.avatarUrl;
        userInfo.createTime = response.createTime || userInfo.createTime;
        userInfo.userHot = response.userHot?? 0; // 如果未定义，默认为 0;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo });   
        // 调用预加载数据函数
        // await preloadRankData();
      } else {
        console.error("Invalid response structure:", response);
      }
    } catch (error) {
      wx.showModal({
        title: "获取用户信息失败",
        content: "请检查网络连接或稍后重试。",
        showCancel: false,
      });
      this.setData({
        hasUserInfo: false,
      })
      console.error('请求失败:', error);
    }

    // 延迟跳转到排行榜页面
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/rank/rank',
      });
    }, delayTime);
  },

  onShareAppMessage() {
    const userInfo=wx.getStorageSync('userInfo')
    // 设置默认分享内容
    return {
      title: '', // 分享标题，默认可以替换为你的小程序名称或页面特定标题
      path: '/pages/welcome/welcome', // 分享路径，必须以 / 开头
      imageUrl: '', // 使用默认页面截图，不设置自定义图片
      promise: new Promise(resolve => {
        // 可以在这里动态生成分享内容，如果不需要动态生成，可删除 promise 参数
        setTimeout(() => {
          resolve({
            title: userInfo.nickName+'邀请你一起为爱发电',
            path: '/pages/welcome/welcome',
            imageUrl: '', // 使用默认截图
          });
        }, 1000); // 1秒延迟模拟异步操作
      })
    };
  },
  onShareTimeline(){
    return {
      title: '加入纸片社，一起为你的二次元白月光发电吧～(っ●ω●)っ',
      path: '/pages/welcome/welcome',
      // query: {
      //   key: value
      // },
      // imageUrl: ''
    }
  },

  
});