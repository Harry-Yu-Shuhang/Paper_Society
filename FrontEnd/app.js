App({
  // 小程序启动的时候运行
  onLaunch() {
    // // 初始化云托管环境
    // wx.cloud.init({
    //   env: 'prod-4guz1brc55a6d768', // 替换为你的云托管环境 ID
    // });
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上版本的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: 'prod-4guz1brc55a6d768', // 替换为你的云环境 ID
      });
    }
  },
})
