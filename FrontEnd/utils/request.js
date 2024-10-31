import {
  baseURL,
  user_login,
  girls_rank_hot,
  girls_rank_score,
  girls_profile_waterfall,
  girls_profile_search,
  girls_detail_get,
  check_card
} from './common_data';

// 通用请求函数，使用 async/await
async function sendRequest(endpoint, method, data = {}) {
  try {
    const res = await new Promise((resolve, reject) => {
      wx.request({
        url: `${baseURL}${endpoint}`,
        method: method,
        data: data,
        header: {
          'Content-Type': 'application/json',
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (error) => {
          reject(error);
        },
      });
    });
    return res;
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
  return sendRequest(check_card, 'POST', { 
    user_id: Number(userId),
    girl_id: Number(girlId)
   });
}

function updateInfos(userInfo) {
  return sendRequest('/update-infos', 'POST', {
    userInfo: userInfo, // 用户信息
    // detailData: detailData // 详细数据
  });
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
};