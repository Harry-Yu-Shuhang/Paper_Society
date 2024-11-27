import {
  baseURL,
  user_login,
  girls_rank_hot,
  girls_rank_score,
  girls_profile_waterfall,
  girls_profile_search,
  girls_detail_get,
} from './common_data';

// 通用请求函数，使用 async/await
// async function sendRequest(endpoint, method, data = {}) {
//   try {
//     const res = await new Promise((resolve, reject) => {
//       wx.request({
//         url: `${baseURL}${endpoint}`,
//         method: method,
//         data: data,
//         header: {
//           'Content-Type': 'application/json',
//         },
//         success: (res) => {
//           resolve(res.data);
//         },
//         fail: (error) => {
//           reject(error);
//         },
//       });
//     });
//     return res;
//   } catch (error) {
//     console.error(`Request failed for ${method} ${endpoint}:`, error);
//     throw error;
//   }
// }


// 通用请求函数，使用云托管内网请求
async function sendRequest(endpoint, method, data = {}) {
  try {
    const res = await wx.cloud.callContainer({
      config: {
        env: 'prod-4guz1brc55a6d768', // 替换为实际的云环境 ID
      },
      path: endpoint, // API 路径
      method: method, // HTTP 方法
      header: {
        'X-WX-SERVICE': 'golang-5kg8', // 替换为实际的服务名称
        'Content-Type': 'application/json',
      },
      data: data, // 请求数据
    });
    return res.data; // 返回业务数据
  } catch (error) {
    console.error(`Request failed for ${method} ${endpoint}:`, error);
    throw error;
  }
}

// 封装用于发送用户数据的函数
function sendUserInfo(userInfo) {
  return sendRequest(user_login, 'POST', userInfo);
}

async function fetchHotRankList(offset) {
  return sendRequest(`${girls_rank_hot}?offset=${offset}`, 'GET');
}

async function fetchScoreRankList(offset) {
  return sendRequest(`${girls_rank_score}?offset=${offset}`, 'GET');
}

async function fetchHotRankListByIds(ids, offset) {
  return sendRequest(`${girls_rank_hot}?ids=${ids.join(',')}&offset=${offset}`, 'GET'); // 添加 offset
}

async function fetchScoreRankListByIds(ids, offset) {
  return sendRequest(`${girls_rank_score}?ids=${ids.join(',')}&offset=${offset}`, 'GET'); // 添加 offset
}

// 获取首页数据
function fetchWaterFallList(params = {}) {
  return sendRequest(girls_profile_waterfall, 'POST', params);
}

// 搜索功能
function fetchSearchList(keyword) {
  return sendRequest(`${girls_profile_search}?keyword=${encodeURIComponent(keyword)}`, 'GET');
}

// 获取角色详情数据
function fetchGirlDetail(gid, userId) {
  return sendRequest(`${girls_detail_get}?gid=${gid}&user_id=${userId}`, 'GET');
}

// 更新签到卡记录
function updateCardRecord(userId, girlId) {
  return sendRequest('/update/cardrecords', 'POST', { 
    user_id: Number(userId),
    girl_id: Number(girlId)
   });
}

function updateInfos(userInfo) {
  return sendRequest('/update/userinfos', 'POST', {
    userInfo: userInfo, // 用户信息
  });
}

// 封装用于增加 views 的函数
function increaseViews(gid) {
  return sendRequest(`/girls/views/increase`, 'POST', { girl_id: gid });
}

// 更新收藏
function updateLikeRecords(userId, girlId, action) {
  return sendRequest(`/update/likerecords`, 'POST', { 
    user_id: userId,
    girl_id: girlId,
    action: action
  });
}


// 更新评分记录
function updateRateRecords(userId, girlId, rating) {
  return sendRequest('/update/raterecords', 'POST', { 
    user_id: userId,
    girl_id: girlId,
    rating: rating
  });
}

// 获取超过的用户百分比
function fetchUserRanking(userId) {
  return sendRequest(`/user/ranking?user_id=${userId}`, 'GET');
}

// 获取用户收藏的角色列表
function fetchUserFavorites(userId) {
  return sendRequest(`/user/favorites?user_id=${userId}`, 'GET');
}

// 获取用户详细信息
function fetchUserInfo(openID) {
  return sendRequest(`/user/info?open_id=${openID}`, 'GET');
}

// 校验昵称是否重复
function checkNickname(nickname) {
  return sendRequest(`/user/checkNickname?nickName=${encodeURIComponent(nickname)}`, 'GET');
}

export {
  sendUserInfo,
  fetchHotRankList,
  fetchScoreRankList,
  fetchWaterFallList,
  fetchSearchList,
  fetchGirlDetail,
  updateCardRecord,
  fetchHotRankListByIds,
  fetchScoreRankListByIds,
  updateInfos,
  increaseViews,
  updateLikeRecords,
  updateRateRecords,
  fetchUserRanking,
  fetchUserFavorites,
  fetchUserInfo,
  checkNickname
};