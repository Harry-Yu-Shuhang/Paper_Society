import { baseURL, user_login, girls_rank_hot, girls_rank_score, girls_profile_waterfall } from './common_data';

// 通用请求函数，使用 async/await
async function sendRequest(endpoint, method, data) {
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

// 封装用于发送用户数据的函数，接收 userInfo 对象
function sendUserInfo(userInfo) {
  return sendRequest(user_login, 'POST', userInfo);
}

// 封装用于获取人气排行榜数据的函数
function fetchHotRankList() {
  return sendRequest(girls_rank_hot, 'GET', {});
}

// 获取评分榜数据
function fetchScoreRankList() {
  return sendRequest(girls_rank_score, 'GET', {});
}

// 获取首页数据
function fetchWaterFallList() {
  return sendRequest(girls_profile_waterfall, 'POST', {});
}

export {
  sendUserInfo,
  fetchHotRankList,
  fetchScoreRankList,
  fetchWaterFallList,
};