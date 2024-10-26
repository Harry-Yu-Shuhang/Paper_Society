// components/loading_window/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    frequency: {
      type: Number,
      value: 400 // 默认跳动时间间隔（毫秒）
    },
    textContent: {
      type: Array,
      value: ['加', '载', '中', '.', '.', '.'] // 默认加载文字
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0, // 当前跳动字符的索引
    textArray: []    // 存储每个字符的文字内容和动画延时
  },

  /**
   * 组件生命周期钩子，attached 在组件实例进入页面节点树时触发
   */
  attached() {
    this.updateTextArray();
    this.startJumpAnimation();
  },

  /**
   * 组件卸载时清除定时器
   */
  detached() {
    clearTimeout(this.jumpTimeout);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化文字数组
    updateTextArray() {
      const textArray = this.data.textContent.map((char) => ({ text: char }));

      // 更新 textArray 数据
      this.setData({
        textArray
      });
    },

    // 启动跳动动画
    startJumpAnimation() {
      // 递归函数，每次跳动一个字符，等当前字符动画完成后跳到下一个
      const jumpNext = () => {
        let newIndex = this.data.currentIndex + 1;
        if (newIndex >= this.data.textArray.length) {
          newIndex = 0;
        }
        this.setData({ currentIndex: newIndex });

        // 设置延时，等待动画完成后跳到下一个字符
        this.jumpTimeout = setTimeout(jumpNext, this.data.frequency);
      };

      // 启动跳动动画
      jumpNext();
    }
  }
});