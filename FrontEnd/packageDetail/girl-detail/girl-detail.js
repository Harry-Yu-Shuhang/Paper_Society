//import {detailList} from "../../data/profiles"

import * as echarts from '../../components/ec-canvas/echarts';

import Toast from '@vant/weapp/toast/toast';

import {fetchGirlDetail, updateCardRecord} from '../../utils/request';

let chart = null;
let detailDataGlobal = null; // 定义全局变量来存储 detailData

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素比
  });
  canvas.setChart(chart);

  // 使用全局变量 detailDataGlobal
  // 渐变色配置
  var gradientColors = [
    { offset: 0, color: '#00f' },    // 蓝色 (冷色)
    { offset: 1, color: '#f00' }     // 红色 (暖色)
  ];
  // 优化后的配置项
  var option = {
    title: {
      text: '平均分: '+detailDataGlobal.AverageRate,
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
        data: detailDataGlobal.RateNum  // 数据
      }
    ]
  };
  chart.setOption(option);
  return chart;
}

function initPieChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

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
      orient: 'horizontal',    // 图例布局方向
      left: 'center',          // 图例位置居中
      bottom: '0%',            // 图例距离底部0%
      textStyle: {
        color: '#666'          // 图例文字颜色
      },
      selectedMode: false       // 禁用点击图例隐藏数据的功能
    },
    series: [
      {
        name: '签到卡与收藏',
        type: 'pie',
        radius: ['40%', '70%'],   // 设置内外半径，形成环形图
        avoidLabelOverlap: false,
        label: {
          show: false,            // 不显示标签文字
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,           // 鼠标悬停或点击时显示标签
            fontSize: '16',
            fontWeight: 'bold',
            // 修改formatter，显示数值和百分比两行
            formatter: function (params) {
              return `${params.percent}%`; //显示和百分比
            }
          },
          itemStyle: {
            //shadowBlur: 20,       // 悬停时增强阴影效果
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false             // 不显示指引线
        },
        data: [
          { value: detailDataGlobal.CardNum, name: '签到卡' },   // 数据1：签到卡
          { value: detailDataGlobal.LikeNum, name: '收藏' }      // 数据2：收藏
        ],
        itemStyle: {
          color: function (params) {
            // 设置签到卡和收藏的颜色
            const colorList = ['#ffa2e1', '#E74C3C'];  // 签到卡：粉色，收藏：红色
            return colorList[params.dataIndex];
          }
        }
      }
    ]
  };

  chart.setOption(option);
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
  },

  onChangeMyRate(event) {
    Toast.success({
      message:'修改评分成功',
      duration:1500
    });
    this.setData({
      myRate: event.detail,
    });
  },

  async onCardIconTap() {
    const gid = this.data.gid; // 获取女孩ID
    const userInfo = wx.getStorageSync('userInfo'); // 先从缓存获取整个 userInfo 对象
    const userId = userInfo ? userInfo.userID : null; // 提取其中的 userID

    try {
      // 发送 POST 请求更新签到卡记录
      const response = await updateCardRecord(userId, gid);

      if (response.alreadyGiven) {
        // 如果今天已经送过签到卡
        Toast.fail({
          message: '今天送过啦',
          duration: 1500
        });
      } else {
        // 如果今天没有送过签到卡
        Toast.success({
          message: '送签到卡成功',
          duration: 1500
        });

        // 更新 detailData.Voted 为 true
        this.setData({
          'detailData.Voted': true,
          'detailData.CardNum': this.data.detailData.CardNum + 1,
        });
      }
    } catch (error) {
      console.error('签到卡请求失败:', error);
      Toast.fail({
        message: '签到卡请求失败，请重试',
        duration: 1500
      });
    }
  },
  
  onLikeIconTap() {
    if (this.data.detailData.liked) {
      // 如果已经收藏过，提示
      Toast.success({
        message:'取消收藏',
        duration:1500
      });
      
      this.setData({
        'detailData.liked': false
      });
    } else {
      // 如果没有收藏，点击后变成已送状态
      Toast.success({
        message:'收藏成功',
        duration:1500
      });

      // 更新 detailData.liked 为 true
      this.setData({
        'detailData.liked': true
      });
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
    } else {
      console.error("gid 未定义或无效:", options.gid);
    }
    
    // 调用 fetchGirlDetail 并传递 userId
    fetchGirlDetail(gid, userId).then((res) => {
      console.log("后端发送来的数据是:", res.data);
      if (res && res.data) {
        this.setData({
          detailData: res.data,
          RateNum: res.data.RateNum.reduce((acc, curr) => acc + curr, 0)
        });
        detailDataGlobal = this.data.detailData; // 存储到全局变量
      }
    }).catch((error) => {
      console.error('获取角色详情失败:', error);
    });

    if (userInfo && userInfo.avatarUrl) {
      this.setData({
        avatarUrl: userInfo.avatarUrl,
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

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