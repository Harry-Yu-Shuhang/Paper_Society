// components/girl-show/girl-show.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    girls:Object,
    gid:null
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapGirl(event){
      const gid = this.properties.girls.girl_id
      this.triggerEvent('profileTap',{
        gid
      })
    }
  }
})