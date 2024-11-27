// packageDetail/avatar-edit/avatar-edit.js
import { updateInfos,checkNickname } from '../../utils/request';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '', // 当前头像链接
    userName: '',  // 当前昵称
    originalUserName: '', // 原始昵称，用于判断昵称是否改变
    originalAvatarUrl: '', // 原始头像链接
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      avatarUrl: userInfo.avatarUrl || 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/user-avatar/default-avatar.png',
      userName: userInfo.nickName || '',
      originalUserName: userInfo.nickName || '',
      originalAvatarUrl: userInfo.avatarUrl || '',
    });
  },

  // 用户选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail; // 获取新头像路径
    this.setData({
      avatarUrl, // 更新头像路径
    });
  },
  
  // 用户输入昵称失去焦点
  onNicknameBlur(e) {
    const userName = e.detail.value.trim(); // 获取用户输入的昵称
    this.setData({
      userName, // 更新昵称
    });
  },
  
  async onSubmit() {
    const { avatarUrl, userName, originalUserName, originalAvatarUrl } = this.data;
  
    // 如果昵称和头像都没有改动，直接提示
    if (userName === originalUserName && avatarUrl === originalAvatarUrl) {
      wx.showToast({ title: '未做任何更改', icon: 'none' });
      return;
    }
  
    // 如果昵称有改动，校验昵称是否合法
    if (userName !== originalUserName) {
      if (!userName.trim()) {
        wx.showToast({ title: '昵称不能为空', icon: 'none' });
        return;
      }

      // 校验名称长度（中文字符算2，英文字符算1）
      let length = 0;
      for (const char of userName) {
        if (/[\u4e00-\u9fa5]/.test(char)) {
          length += 2; // 中文字符算2
        } else {
          length += 1; // 英文字符算1
        }
      }
      if (length > 16) {
        wx.showToast({ title: '名称太长了，请重新输入', icon: 'none' });
        return;
      }
  
      // 校验昵称内容合法性
      const valid = /^[\u4e00-\u9fa5_a-zA-Z0-9-]+$/.test(userName);
      if (!valid) {
        wx.showToast({ title: '昵称只能包含中文、英文、数字、_ 和 -', icon: 'none' });
        return;
      }
    }
  
    wx.showLoading({ title: '提交中...' });
  
    try {
      const userInfo = wx.getStorageSync('userInfo');
      const userID = userInfo.userID; // 从缓存获取用户ID
  
      let newAvatarUrl = originalAvatarUrl; // 默认使用原始头像链接
  
      // 如果头像有改动，上传新头像
      if (avatarUrl !== originalAvatarUrl) {
        const cloudPath = `user-avatar/userID=${userID}_time=${Date.now()}.png`;
        const uploadRes = await this.withTimeout(
          wx.cloud.uploadFile({ cloudPath, filePath: avatarUrl }),
          5000,
          '上传头像超时'
        );
        newAvatarUrl = uploadRes.fileID;
  
        // 删除旧头像文件
        if (originalAvatarUrl?.startsWith('cloud://')) {
          await this.withTimeout(
            wx.cloud.deleteFile({ fileList: [originalAvatarUrl] }),
            5000, // 超时时间 5 秒
            '删除旧头像超时'
          );
        }
      }
  
      // 如果昵称有改动，校验是否重复
      if (userName !== originalUserName) {
        const nicknameCheck = await this.withTimeout(
          checkNickname(userName), // 调用昵称校验接口
          5000, // 超时时间 5 秒
          '校验昵称超时'
        );
        if (nicknameCheck.isDuplicate) {
          wx.showToast({ title: '昵称已被占用，换一个吧', icon: 'none' });
          return;
        }
      }
  
      // 更新缓存（昵称改变或头像改变时均更新）
      const updatedUserInfo = {
        ...userInfo,
        avatarUrl: newAvatarUrl,
        nickName: userName,
      };
      wx.setStorageSync('userInfo', updatedUserInfo);
  
      // 更新后端
      await this.withTimeout(
        updateInfos(updatedUserInfo),
        5000,
        '更新用户信息超时'
      );
      wx.hideLoading()
      wx.showToast({ title: '更新成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    } catch (error) {
      wx.hideLoading();
      if (error.message.includes('超时')) {
        wx.showToast({ title: '更新超时', icon: 'none' });
      } else {
        wx.showToast({ title: '更新失败', icon: 'error' });
      }
      console.error('更新失败：', error);
    } 
  },

  // 超时处理函数
  withTimeout(promise, timeout, errorMessage) {
    let timer;
    return Promise.race([
      promise.finally(() => clearTimeout(timer)), // 确保清理定时器
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeout)
      ),
    ]);
  },

  // 取消操作
  onCancel() {
    wx.navigateBack();
  },
});