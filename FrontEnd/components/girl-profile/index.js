// components/girl-profile/index.js

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    girlProfile:Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    girlInfo:{},
  },

  // 组件的生命周期
  lifetimes: {
    ready(){
      this.initData();
    },
  },

    /**
   * 监听属性变化
   */
  observers: {
    'girlProfile': function(newProfile) {
      // 当 girlProfile 更新时，更新 girlInfo 数据
      this.setData({
        girlInfo: newProfile
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData(){
      this.setData({
        girlInfo:this.properties.girlProfile
      });
    }
  }
})