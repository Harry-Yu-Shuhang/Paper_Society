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