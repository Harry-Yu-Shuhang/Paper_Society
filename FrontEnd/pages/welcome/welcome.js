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
    // const { inviter, character, gid } = options;
    const inviter = decodeURIComponent(options.inviter);
    const character = decodeURIComponent(options.character);
    const gid = options.gid
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
        return;
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
        return;
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
      // 确保 userInfo 的完整性
      let userInfo = wx.getStorageSync('userInfo') || {};
      userInfo = {
        userID: userInfo.userID ?? null,
        avatarUrl: userInfo.avatarUrl ?? "",
        cardCount: userInfo.cardCount ?? 0,
        isNewUser: userInfo.isNewUser ?? false,
        isSameDay: userInfo.isSameDay ?? false,
        nickName: userInfo.nickName ?? "",//新同学
        openID: userInfo.openID ?? "",
        userHot: userInfo.userHot ?? 0,
        createTime: userInfo.createTime ?? 0,
      };
  
      this.setData({
        hasUserInfo: true,
        userInfo,
      });
  
      // 获取用户头像和昵称
      const profileRes = await wx.getUserProfile({ desc: '用于身份验证' });
      const { nickName, avatarUrl } = profileRes.userInfo;
      userInfo.avatarUrl = avatarUrl;
  
      // 更新 userInfo
      this.setData({ userInfo });
      wx.setStorageSync('userInfo', userInfo);
  
      // 登录逻辑
      this.handleUserLogin();
    } catch (err) {
      console.error("授权失败:", err);
      wx.showModal({
        title: "登陆失败",
        content: "网络连接失败",
        showCancel: false,
      });
      this.setData({
        hasUserInfo: false,
      });
      return;
    }
  },


  async handleUserLogin() {
    const userInfo  = this.data.userInfo;
    try {
      const openID = userInfo.openID;
      if (!openID) {
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
          return;
        }
      }
      const response = await sendUserInfo(userInfo);
      if (response && typeof response === 'object') {
        //console.log("userInfo是:",userInfo)
        //console.log("response是:",response)
        // 更新 userInfo 对象的属性而不重新赋值整个对象(因为userInfo是const)
        userInfo.userID = response.userID || userInfo.userID;
        userInfo.cardCount = response.cardCount ?? 0; // 如果未定义，默认为 0
        userInfo.isNewUser = response.isNewUser !== undefined ? response.isNewUser : userInfo.isNewUser;
        userInfo.isSameDay = response.isSameDay !== undefined ? response.isSameDay : userInfo.isSameDay;
        userInfo.nickName = response.nickName || userInfo.nickName;
        // if(userInfo.isNewUser===true){
        //   userInfo.nickName=userInfo.nickName+String(userInfo.userID)
        // }
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
      return;
    }

    // 延迟跳转到排行榜页面
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/rank/rank',
      });
    }, delayTime);
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
          title: userInfo.nickName || '新同学'+'邀请你加入纸片社',
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
    }
  },
});
