App({
  // 小程序启动的时候运行
  onLaunch() {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上版本的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: 'golang-5kg8-001', // 替换为你的云环境 ID
        traceUser: true
      });
    }
  },
  gBaseUrl:"http://t.talelin.com/v2/movie/"
})
