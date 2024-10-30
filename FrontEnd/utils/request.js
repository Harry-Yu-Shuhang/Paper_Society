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

// 获取首页数据
function fetchWaterFallList(params = {}) {
  return sendRequest(girls_profile_waterfall, 'POST', params);
}

// 搜索功能
function fetchSearchList(keyword) {
  return sendRequest(`${girls_profile_search}?keyword=${encodeURIComponent(keyword)}`, 'GET');
}

// 获取角色详情数据
function fetchGirlDetail(gid) {
  return sendRequest(girls_detail_get+`?gid=${gid}`, 'GET');
}

export {
  sendUserInfo,
  fetchHotRankList,
  fetchScoreRankList,
  fetchWaterFallList,
  fetchSearchList,
  fetchGirlDetail,
};