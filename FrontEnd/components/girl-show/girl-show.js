// components/girl-show/girl-show.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    girls: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    views: 0 // 用于动态更新 views 的数据
  },

  observers: {
    'girls.views': function (newViews) {
      // 如果 `girls.views` 更新，则同步更新到组件的 data
      this.setData({ views: newViews });
    }
  },

  lifetimes: {
    attached() {
      // 初始化 views 数据
      this.setData({ views: this.properties.girls.views });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapGirl(event) {
      console.log(this.properties.girls);

      // 更新 views 数据
      const updatedViews = this.properties.girls.views + 1;
      this.setData({
        'girls.views': updatedViews, // 更新到 properties
        views: updatedViews // 更新到 data
      });

      // 触发事件，传递 gid
      const gid = this.properties.girls.id;
      this.triggerEvent('profileTap', {
        gid
      });
    }
  }
});