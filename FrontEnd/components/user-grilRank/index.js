Component({
  /**
   * 组件的属性列表
   */
  properties: {
    girl: Object // 接收父组件传递的 girl 对象
  },

  /**
   * 组件的初始数据
   */
  data: {
    ratingValue: 0 // 初始化评分值
  },

  lifetimes: {
    attached() {
      // 设置初始评分值
      const { rating } = this.properties.girl;
      if (rating && rating.stars) {
        this.setData({
          ratingValue: rating.stars / 10
        });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 处理评分变化
    onRateChange(event) {
      this.setData({
        ratingValue: event.detail
      });
    },

    // 跳转到详情页面
    onGoToDetail() {
      const { girl_id } = this.properties.girl;
      if (girl_id) {
        wx.navigateTo({
          url: `/pages/movie-detail/movie-detail?mid=${girl_id}`
        });
      }
    }
  }
});