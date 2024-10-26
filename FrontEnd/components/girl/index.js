// components/girl/index.js
Component({

  /**
   * 组件的属性列表
   */

  properties: {
      girl:Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    value: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      this.setData({
        value: event.detail,
      });
    },

    onGoToDetail(event){
      const mid = this.properties.girl.girl_id
      wx.navigateTo({
        url: '/pages/movie-detail/movie-detail?mid=' + mid,
      })
    }
  }
})