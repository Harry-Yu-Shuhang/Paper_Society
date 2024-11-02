// components/success_loading/index.js
Component({
  properties: {
    text: { // 定义 text 属性
      type: String,
      value: '加载成功喵(〃∀〃)' // 默认值
    }
  },
  data: {
    displayDuration: 3000 // 显示时长，全局变量
  },

  attached() {
    this.hideAfterDelay();
  },

  methods: {
    hideAfterDelay() {
      setTimeout(() => {
        this.triggerEvent('close'); // 自定义事件，通知父级组件关闭弹窗
      }, this.data.displayDuration);
    }
  }
});