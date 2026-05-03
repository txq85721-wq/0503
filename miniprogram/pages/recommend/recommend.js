const { request } = require('../../utils/request')

Page({
  data: {
    plan: null,
    loading: false
  },

  async generatePlan() {
    const profile = wx.getStorageSync('profile')
    if (!profile) {
      wx.showToast({ title: '请先填写档案', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    try {
      const result = await request({
        url: '/recommend',
        method: 'POST',
        data: profile
      })

      this.setData({ plan: result })
    } catch (err) {
      wx.showToast({ title: '请求失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
