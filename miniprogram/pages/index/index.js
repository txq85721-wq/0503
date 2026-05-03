const { login, getOpenid } = require('../../utils/auth')

Page({
  data: {
    todayCalories: 0,
    remainingCalories: 0,
    targetCalories: 1800,
    progressPercent: 0,
    aiSummary: '',
    dinnerSuggestion: ''
  },

  async ensureOpenid() {
    let openid = getOpenid()
    if (!openid) {
      const res = await login()
      openid = res.openid
    }
    return openid
  },

  async loadData() {
    const openid = await this.ensureOpenid()

    wx.request({
      url: `${getApp().globalData.apiBaseUrl}/record/list`,
      data: { openid },
      success: (res) => {
        const records = res.data || []
        const total = records.reduce((sum, r) => sum + Number(r.calories || 0), 0)

        const target = this.data.targetCalories
        const remaining = target - total
        const percent = Math.min(100, (total / target) * 100)

        this.setData({
          todayCalories: total,
          remainingCalories: remaining,
          progressPercent: percent
        })
      }
    })
  },

  onShow() {
    this.loadData()
  }
})
