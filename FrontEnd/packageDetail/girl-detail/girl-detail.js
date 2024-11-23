import * as echarts from '../../components/ec-canvas/echarts';

import {fetchGirlDetail, updateCardRecord, updateInfos, increaseViews, updateLikeRecords, updateRateRecords} from '../../utils/request';

import Dialog from '@vant/weapp/dialog/dialog';

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素比
  });
  this.chart = chart; // 保存实例到页面上下文中
  canvas.setChart(chart);
  // 从缓存中读取 detailData
  const detailData = wx.getStorageSync('detailData');
  // 设置默认的平均分为 0 分
  const averageRate = detailData && detailData.AverageRate ? detailData.AverageRate : 0;
  // 渐变色配置
  var gradientColors = [
    { offset: 0, color: '#00f' },    // 蓝色 (冷色)
    { offset: 1, color: '#f00' }     // 红色 (暖色)
  ];
  // 优化后的配置项
  var option = {
    title: {
      text: '平均分: ' + averageRate,
      left: 'center',          // 标题居中
      textStyle: {
        fontSize: 16,          // 标题字体大小
        fontWeight: 'bold',    // 加粗字体
        color: '#333'          // 字体颜色
      }
    },
    tooltip: {
      trigger: 'none'          // 禁用悬停或点击柱子后显示数据
    },
    legend: {
      data: ['评价人数'],
      bottom: 0,               // 图例在图表底部
      selectedMode: false,      // 禁用点击图例后隐藏数据
      textStyle: {
        color: '#666',           // 图例字体颜色
        fontSize: 14
      }
    },
    grid: {
      top: '20%',               // 调整网格顶部边距，防止标题重叠
      left: '10%',              // 网格距容器左侧的距离
      right: '10%',             // 网格距容器右侧的距离
      bottom: '12%',            // 网格距容器底部的距离
      containLabel: true        // 网格区域包含坐标轴的标签
    },
    xAxis: {
      type: 'category',         // 类别型 x 轴
      data: ['1', '2', '3', '4', '5'], // X轴标签
      axisLine: {
        lineStyle: {
          color: '#888'         // 设置轴线颜色
        }
      },
      axisTick: {
        alignWithLabel: true     // 让刻度与标签对齐
      },
      axisLabel: {
        fontSize: 12,            // 标签字体大小
        color: '#666'            // 标签颜色
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false              // 隐藏Y轴轴线
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',        // 虚线分割线
          color: '#ddd'          // 分割线颜色
        }
      },
      axisLabel: {
        fontSize: 12,            // 标签字体大小
        color: '#666'            // 标签颜色
      }
    },
    series: [
      {
        name: '评价人数',
        type: 'bar',
        barWidth: '50%',          // 柱状图宽度
        itemStyle: {
          color: function (params) {
            // 根据数值设置颜色，使用线性渐变
            let gradientColor;
            if (params.dataIndex === 0) {
              gradientColor = '#B3E5FC'; // 1星评分
            } else if (params.dataIndex === 1) {
              gradientColor = '#81D4FA'; // 2星评分
            } else if (params.dataIndex === 2) {
              gradientColor = '#4FC3F7'; // 3星评分
            } else if (params.dataIndex === 3) {
              gradientColor = '#29B6F6'; // 4星评分
            } else {
              gradientColor = '#0288D1'; // 5星评分
            }
            return gradientColor;
          },
          borderRadius: [5, 5, 0, 0]
        },
        label: {
          show: true,            // 显示柱子顶部的数值
          position: 'top',        // 位置在顶部
          fontSize: 12,           // 字体大小
          color: '#333'           // 字体颜色
        },
        data: detailData ? detailData.RateNum : [] // 数据
      }
    ]
  };
  chart.setOption(option);

  // 更新初始数据
  this.updateCharts();
  return chart;
}

function initPieChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  this.pieChart = chart; // 保存实例到页面上下文中
  canvas.setChart(chart);
  // 从缓存中读取 detailData
  const detailData = wx.getStorageSync('detailData');

  // 饼图配置
  var option = {
    title: {
      text: '签到卡与收藏分布',
      left: 'center',
      textStyle: {
        fontSize: 16,          // 标题字体大小
        fontWeight: 'bold',    // 标题加粗
        color: '#333'          // 标题颜色
      }
    },
    tooltip: {
      trigger: 'none'          // 禁用饼图点击后的提示框
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      data: ['签到卡', '收藏'],
      textStyle: {
        color: '#666'
      },
      selectedMode: false
    },
    series: [
      {
        name: '签到卡与收藏',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        startAngle: 270, // 调整饼图起始角度
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
            formatter: function (params) {
              const name = params.name;
              const value = params.value;
              const percent = params.percent;
              
              if (name === '签到卡') {
                return `${value}张\n${percent}%`;
              } else if (name === '收藏') {
                return `${value}次\n${percent}%`;
              }
            }
          },
          itemStyle: {
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: detailData ? detailData.CardNum : 0, name: '签到卡' },
          { value: detailData ? detailData.LikeNum : 0, name: '收藏' }
        ],
        itemStyle: {
          color: function (params) {
            const colorList = ['#ffa2e1', '#E74C3C']; // 签到卡：粉色，收藏：红色
            return colorList[params.dataIndex];
          }
        }
      }
    ]
  };

  chart.setOption(option);

  // 更新初始数据
  this.updateCharts();
  return chart;
}

Page({

  /**
   * 页面的初始数据
   */
  //初始化data
  data: {
    gid:null, //存储女孩的girl_id
    detailData:{},
    RateNum:null,//存储评论总人数
    ec: {
      onInit: initChart
    },
    pieEc: {
      onInit: initPieChart  // 初始化饼图
    },
    avatarUrl: '', // 用于存储头像链接
    isSuccess: false, // 成功弹窗状态
    isFail: false, // 失败弹窗状态
    failReason: '信号飞到三次元了', // 失败原因
    successReason: '加载成功喵(〃∀〃)',//成功原因
    isLoading: false, // 加载弹窗状态
    updatedRating: null, // 新的评分，仅在必要时更新到后端
  },

  // onChangeMyRate(event) {
  //   const newRating = event.detail;
  //   const currentRating = this.data.detailData.MyRate;

  //   // 如果评分没有变化，不执行后续操作
  //   if (newRating === currentRating) {
  //     return;
  //   }

  //   // 更新评分
  //   const updatedDetailData = { ...this.data.detailData, MyRate: newRating };
  //   this.setData({
  //     detailData: updatedDetailData,
  //   });

  //   // 获取用户信息和女孩的ID
  //   const userInfo = wx.getStorageSync('userInfo');
  //   const userId = userInfo ? userInfo.userID : null;
  //   const girlId = this.data.gid;
  //   this.setData({
  //     isSuccess: true, 
  //     successReason: '修改评分成功喵(〃∀〃)'
  //   });
  //   // 1秒后关闭弹窗
  //   setTimeout(() => {
  //     this.setData({ isSuccess: false });
  //   }, 500);

  //   // 向后端发送评分修改请求
  //   const response = updateRateRecords(userId, girlId, newRating)
  //     .then(() => {
  //       // 如果是首次评分，增加热度
  //       if (!currentRating) {
  //         userInfo.userHot += 1;
  //         wx.setStorageSync('userInfo', userInfo);
  //       }
  //       // 请求成功后，将更新的评分存入缓存
  //       wx.setStorageSync('detailData', updatedDetailData);
  //     })
  //     .catch(error => {
  //       console.error('评分修改失败:', error);
  //       this.setData({
  //         isFail: true, // 显示失败弹窗
  //         failReason: '信号飞到三次元了'
  //       });
  //       // 1秒后关闭失败弹窗
  //       setTimeout(() => {
  //         this.setData({ isFail: false });
  //       }, 500);
  //     });
  //     this.addRequestToQueue(response); // 添加到队列
  // },

  onChangeMyRate(event) {
    const newRating = event.detail;
    const currentRating = this.data.detailData.MyRate;
  
    // 如果评分没有变化，不执行后续操作
    if (newRating === currentRating) {
      return;
    }
    
    const userInfo = wx.getStorageSync('userInfo');
    //第一次评分，增加热度
    if (!currentRating) {
      userInfo.userHot += 1;
      wx.setStorageSync('userInfo', userInfo);
    }
  
    // 更新评分到 detailData 和 updatedRating
    const updatedDetailData = { ...this.data.detailData, MyRate: newRating };
    this.setData({
      detailData: updatedDetailData,
      updatedRating: newRating, // 存储新的评分
    });
  
    this.setData({
      isSuccess: true, 
      successReason: '修改评分成功喵(〃∀〃)',
    });
  
    // 1秒后关闭弹窗
    setTimeout(() => {
      this.setData({ isSuccess: false });
    }, 500);
  
    // 将更新后的数据存入缓存
    wx.setStorageSync('detailData', updatedDetailData);
  },

  async onCardIconTap() {
    const gid = this.data.gid; // 获取女孩ID
    const userInfo = wx.getStorageSync('userInfo'); // 先从缓存获取整个 userInfo 对象
    const userId = userInfo ? userInfo.userID : null; // 提取其中的 userID
    const detailData = wx.getStorageSync('detailData'); // 获取缓存中的 detailData

    // 检查卡数量是否足够
    if (userInfo.cardCount <= 0) {
      // 检查是否已经送过卡
      if (detailData.Voted) {
        this.setData({
          isFail: true, // 显示失败弹窗
          failReason: '今天给她送过啦'
        });
        // 1秒后关闭失败弹窗
        setTimeout(() => {
          this.setData({ isFail: false });
        }, 500);
        return; // 已送过卡，直接退出
      }else{
        this.setData({
          isFail: true, // 显示失败弹窗
          failReason: '没有签到卡了呜'
        });
        // 1秒后关闭失败弹窗
        setTimeout(() => {
          this.setData({ isFail: false });
        }, 500);
        return; // 卡不足时退出，不发送请求
      }
    }
  
    try {
        if (detailData.Voted) {
          this.setData({
            isFail: true, // 显示失败弹窗
            failReason: '今天给她送过啦'
          });
          // 1秒后关闭失败弹窗
          setTimeout(() => {
            this.setData({ isFail: false });
          }, 500);
          return; // 退出函数
        }
        // 成功送出签到卡，增加热度
        userInfo.userHot += 1;
        // 更新缓存中的 userInfo.cardCount 并存入缓存
        userInfo.cardCount -= 1;

        this.setData({
          isSuccess: true, 
          successReason: '送签到卡成功喵(〃∀〃)'
        });
        setTimeout(() => {
            this.setData({ isSuccess: false });
        }, 500);
  
        // 更新 detailData.Voted 为 true
        this.setData({
            'detailData.Voted': true,
            'detailData.CardNum': this.data.detailData.CardNum + 1,
        });

        wx.setStorageSync('userInfo', userInfo); // 更新缓存中的 userInfo
        wx.setStorageSync('detailData', this.data.detailData); // 更新缓存中的 detailData
        updateCardRecord(userId, gid)//最后发送请求给后台
    } catch (error) {
        console.error('签到卡请求失败:', error);
        this.setData({
          isFail: true, 
          failReason: '信号飞到三次元了'
        });
        setTimeout(() => {
            this.setData({ isFail: false });
        }, 500);
    }
  },

  async onLikeIconTap() {
    const gid = wx.getStorageSync('detailData').ID; // 获取角色 ID
    const userInfo = wx.getStorageSync('userInfo');
    const userId = userInfo ? userInfo.userID : null;
    const girlName = this.data.detailData.Name; // 动态获取角色名
  
    // 判断当前收藏状态
    const isLiked = this.data.detailData.Liked;
  
    if (isLiked) {
      const beforeClose = (action) => {
        return new Promise(async (resolve) => {
          if (action === 'confirm') {
            try {
              // 更新收藏状态和热度
              userInfo.userHot -= 3;
              resolve(true); // 确保弹窗关闭
              this.setData({
                // isSuccess: true,
                successReason: '取消收藏成功喵(〃∀〃)',
                'detailData.Liked': false,
                'detailData.LikeNum': this.data.detailData.LikeNum - 1,
              });
              // 成功后关闭弹窗
              setTimeout(() => {
                this.setData({ isSuccess: true, });
              }, 500);
              // 更新缓存
              wx.setStorageSync('userInfo', userInfo);
              wx.setStorageSync('detailData', this.data.detailData);
              // 成功后关闭弹窗
              setTimeout(() => {
                this.setData({ isSuccess: false });
              }, 1000);
              //给后端发送请求
              const response = await updateLikeRecords(userId, gid, 'unlike');
            } catch (error) {
              console.error('取消收藏失败:', error);
              setTimeout(() => {
                this.setData({
                  isFail: true,
                  failReason: '信号飞到三次元了',
                });
              },500);
              setTimeout(() => {
                this.setData({ isFail: false });
              }, 1000);
              resolve(true); // 确保弹窗关闭
            }
          } else {
            resolve(true); // 用户取消操作时立即关闭弹窗
          }
        });
      };
      Dialog.confirm({
        title: `确定要取消收藏 ${girlName} 吗？`, // 动态插入角色名
        message: `收藏的天数会清空，一定要慎重哦(⋟﹏⋞)`,
        beforeClose,
      }).catch(() => {
        console.log('取消收藏操作被用户中止');
      });
    } else {
      // 收藏操作
      try {
        // const response = await updateLikeRecords(userId, gid, 'like');
        // 更新收藏状态和热度
        userInfo.userHot += 3;
        this.setData({
          isSuccess: true,
          successReason: '收藏成功喵(〃∀〃)',
          'detailData.Liked': true,
          'detailData.LikeNum': this.data.detailData.LikeNum + 1,
        });
        setTimeout(() => {
          this.setData({ isSuccess: false });
        }, 500);
        // 更新缓存
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('detailData', this.data.detailData);
        const response = await updateLikeRecords(userId, gid, 'like');
      } catch (error) {
        console.error('收藏操作失败:', error);
        this.setData({
          isFail: true,
          failReason: '信号飞到三次元了',
        });
        setTimeout(() => {
          this.setData({ isFail: false });
        }, 500);
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad(options) {
    const gid = Number(options.gid);
    const userInfo = wx.getStorageSync('userInfo'); // 获取用户信息
    const userId = userInfo ? userInfo.userID : null; // 获取 userID
  
    if (!isNaN(gid)) {
      this.setData({
        gid: gid // 将 gid 设置到 data 中
      });
      // 检查缓存是否有匹配的 detailData
      const cachedDetailData = wx.getStorageSync('detailData');
      if (cachedDetailData && cachedDetailData.ID === gid) {
        // 如果缓存中存在且ID匹配，直接使用缓存数据
        this.setData({
          detailData: cachedDetailData,
          RateNum: cachedDetailData.RateNum.reduce((acc, curr) => acc + curr, 0)
        });
      } else {
        // 如果缓存不存在或ID不匹配，发起请求并存入缓存
        fetchGirlDetail(gid, userId).then((res) => {
          if (res && res.data) {
            this.setData({
              detailData: res.data,
              RateNum: res.data.RateNum.reduce((acc, curr) => acc + curr, 0)
            });
            // 将新获取的数据存入缓存
            wx.setStorageSync('detailData', res.data);
          }
        }).catch((error) => {
          console.error('获取角色详情失败:', error);
          this.setData({
            isFail:true,
          })
          // 800毫秒后关闭弹窗
          setTimeout(() => {
            this.setData({isFail: false });
          }, 800);
          return;
        });
      }
    } else {
      console.error("gid 未定义或无效:", options.gid);
      this.setData({
        isFail:true
      })
      // 800毫秒后关闭弹窗
      setTimeout(() => {
        this.setData({isFail: false });
      }, 800);
      return;
    }

    if (userInfo && userInfo.avatarUrl) {
      this.setData({
        avatarUrl: userInfo.avatarUrl,
      });
    }

    // 调用 incrementViews 来增加 views
    increaseViews(gid).catch(error => {
      console.error("增加 views 失败:", error);
    });
  },

  updateCharts() {
    const detailData = this.data.detailData;
    if (this.chart) {
      this.chart.setOption({
        series: [{ data: detailData.RateNum || [] }],
        title: { text: '平均分: ' + (detailData.AverageRate || 0) }
      });
    }
    if (this.pieChart) {
      this.pieChart.setOption({
        series: [{
          data: [
            { value: detailData.CardNum || 0, name: '签到卡' },
            { value: detailData.LikeNum || 0, name: '收藏' }
          ]
        }]
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.setData({
      ec: {
        onInit: initChart.bind(this)
      },
      pieEc: {
        onInit: initPieChart.bind(this)
      }
    });
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
   * 生命周期函数--监听页面卸载
   */
  // async onUnload() {
  //   const userInfo = wx.getStorageSync('userInfo'); // 读取缓存中的 userInfo
  //   if (userInfo && userInfo.userID) {
  //     try {
  //       // 发送请求更新用户信息，包括 cardCount 和未来可能的其他字段
  //       await updateInfos(userInfo);
  //       wx.setStorageSync('userInfo', userInfo); // 更新缓存
  //       wx.setStorageSync('detailData', this.data.detailData); // 更新缓存中的 detailData
  //     } catch (error) {
  //       console.error('更新 cardCount 到后端失败:', error);
  //     }
  //   }
  // },

  async onUnload() {
    const userInfo = wx.getStorageSync('userInfo'); // 获取用户信息
    const userId = userInfo ? userInfo.userID : null; // 获取 userID
    const updatedRating = this.data.updatedRating; // 获取新的评分
    const girlId = this.data.gid;
  
    if (userId && updatedRating !== null) {
      try {
        // 更新评分到后端
        await updateRateRecords(userId, girlId, updatedRating);
        this.setData({ updatedRating: null }); // 重置更新状态
      } catch (error) {
        console.error('更新评分到后端失败:', error);
      }
    }
  
    // 其他卸载逻辑
    if (userInfo) {
      try {
        await updateInfos(userInfo);
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('detailData', this.data.detailData);
      } catch (error) {
        console.error('更新用户信息到后端失败:', error);
      }
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async onPullDownRefresh() {
    wx.stopPullDownRefresh();
    this.setData({isLoading:true})

    // 定义一个变量标记是否超时
    let isTimeout = false;
    // 启动超时计时器，5秒后设置超时状态
    const timeout = setTimeout(() => {
      isTimeout = true;
      this.setData({ 
        isLoading: false, 
        isFail: true,
        failReason:'信号似乎不大好喵', 
      });
      // 在 500ms 后清除成功或失败状态提示
      setTimeout(() => {
        this.setData({ isFail: false });
      }, 500);
      console.warn('刷新超时，停止请求响应');
    }, 8000); // 超时时间 8 秒

    const gid = this.data.gid; // 当前女孩的 ID
    const userInfo = wx.getStorageSync('userInfo'); // 获取用户信息
    const userId = userInfo ? userInfo.userID : null; // 获取 userID
    const updatedRating = this.data.updatedRating; // 获取新的评分
  
    if (gid && userId) {
      // 如果有更新的评分，先同步到后端
      if (updatedRating !== null) {
        try {
          await updateRateRecords(userId, gid, updatedRating);
          this.setData({ updatedRating: null }); // 重置更新状态
        } catch (error) {
          console.error('更新评分到后端失败:', error);
        }
      }

      fetchGirlDetail(gid, userId)
        .then((res) => {
          // 检查是否已超时
          if (isTimeout) return;
          if (res && res.data) {
            this.setData({
              detailData: res.data,
              RateNum: res.data.RateNum.reduce((acc, curr) => acc + curr, 0)
            });
            wx.setStorageSync('detailData', res.data);
            // 更新图表数据
            this.updateCharts();
          }
          this.setData({
            detailData: res.data,
            RateNum: res.data.RateNum.reduce((acc, curr) => acc + curr, 0),
            isSuccess: true, // 显示成功弹窗
            successReason: '刷新成功喵(〃∀〃)'
          });
          // 500毫秒后关闭成功弹窗
          setTimeout(() => {
            this.setData({ isSuccess: false });
          }, 500);
        })
        .catch((error) => {
          // 检查是否已超时
          if (isTimeout) return;
          console.error('刷新角色详情失败:', error);
          this.setData({
            isFail: true, // 显示失败弹窗
            failReason: '信号飞到三次元了'
          });
          // 500毫秒后关闭失败弹窗
          setTimeout(() => {
            this.setData({ isFail: false });
          }, 500);
        })
        .finally(() => {
          if (!isTimeout) {
            clearTimeout(timeout); // 清除定时器
            this.setData({ isLoading: false });
          }
        });
    } else {
      clearTimeout(timeout); // 清除定时器
      this.setData({
        isFail: true, // 显示失败弹窗
        failReason: '无效的用户信息'
      });
      // 1秒后关闭失败弹窗
      setTimeout(() => {
        this.setData({ isFail: false });
      }, 1000);
    }
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