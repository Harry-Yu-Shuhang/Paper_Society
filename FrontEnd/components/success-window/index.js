// components/success_loading/index.js
Component({
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