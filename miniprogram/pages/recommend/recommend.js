Page({
  data: {
    plan: null
  },

  generatePlan() {
    const profile = wx.getStorageSync('profile')
    if (!profile) {
      wx.showToast({ title: '请先填写档案', icon: 'none' })
      return
    }

    // mock AI
    const plan = {
      breakfast: '鸡蛋 + 燕麦',
      lunch: '鸡胸肉 + 米饭 + 蔬菜',
      dinner: '鱼 + 沙拉'
    }

    this.setData({ plan })
  }
})
