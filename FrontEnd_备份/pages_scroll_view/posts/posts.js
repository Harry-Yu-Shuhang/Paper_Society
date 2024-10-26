import {postList, rankList} from '../../data/data'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    postList:{},
  },

  /**
   * 生命周期函数--监听页面加载,也叫钩子函数(hook function)
   */
  onLoad(options) {
    
    this.setData({
      postList
    }) 

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow(){
    
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

  },

  onGoToDetail(event){
    // console.log("监听")
    const pid = event.detail.pid
    // console.log(pid)
    wx.navigateTo({
      url: '/packageDetail/post-detail/post-detail?pid='+pid,
    })
  },

})