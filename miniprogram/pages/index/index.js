const { login, getOpenid } = require('../../utils/auth')

function getAiProvider() {
  return wx.getStorageSync('aiProvider') || 'deepseek'
}

Page({
  data: {
    todayCalories: 0,
    remainingCalories: 0,
    targetCalories: 1800,
    progressPercent: 0,
    aiSummary: '',
    dinnerSuggestion: '',
    streak: 0,
    checkedToday: false,
    checkinText: '今日未打卡',
    shareText: ''
  },

  async ensureOpenid() {
    let openid = getOpenid()
    if (!openid) {
      const res = await login()
      openid = res.openid
    }
    return openid
  },

  onShareAppMessage() {
    return {
      title: this.data.shareText || '我正在用 LESSugar 记录少糖饮食',
      path: '/pages/index/index'
    }
  },

  buildShareText(todayCalories, targetCalories, streak) {
    const status = todayCalories <= targetCalories ? '今日控糖达标' : '今日继续调整'
    return `LESSugar 打卡：${status}，已摄入 ${todayCalories}/${targetCalories} kcal，连续打卡 ${streak || 0} 天`
  },

  async loadData() {
    const openid = await this.ensureOpenid()
    const plan = wx.getStorageSync('latestPlan') || {}
    const targetCalories = plan.daily_calorie_target || 1800

    wx.request({
      url: `${getApp().globalData.apiBaseUrl}/record/list`,
      data: { openid },
      success: (res) => {
        const records = res.data || []
        const todayCalories = records.reduce((sum, r) => sum + Number(r.calories || 0), 0)
        const totalProtein = records.reduce((sum, r) => sum + Number(r.protein || 0), 0)
        const remainingCalories = targetCalories - todayCalories
        const progressPercent = Math.min(100, Math.round((todayCalories / targetCalories) * 100))

        this.setData({
          todayCalories,
          targetCalories,
          remainingCalories,
          progressPercent,
          shareText: this.buildShareText(todayCalories, targetCalories, this.data.streak)
        })

        this.loadAIInsight(records, todayCalories, targetCalories, totalProtein)
      },
      fail: () => {
        wx.showToast({ title: '加载记录失败', icon: 'none' })
      }
    })

    wx.request({
      url: `${getApp().globalData.apiBaseUrl}/checkin/status`,
      data: { openid },
      success: (res) => {
        const streak = res.data?.streak || 0
        const checkedToday = !!res.data?.checkedToday
        this.setData({
          streak,
          checkedToday,
          checkinText: checkedToday ? '今日已打卡' : '今日未打卡',
          shareText: this.buildShareText(this.data.todayCalories, this.data.targetCalories, streak)
        })
      }
    })
  },

  loadAIInsight(records, totalCalories, targetCalories, totalProtein) {
    if (!records.length) {
      this.setData({
        aiSummary: '今天还没有饮食记录，先记录一餐，LESSugar 会给你生成个性化反馈。',
        dinnerSuggestion: '建议从早餐或午餐开始记录，优先选择低糖、高蛋白食物。'
      })
      return
    }

    wx.request({
      url: `${getApp().globalData.apiBaseUrl}/insight/daily`,
      method: 'POST',
      data: {
        totalCalories,
        targetCalories,
        totalProtein,
        aiProvider: getAiProvider()
      },
      header: { 'content-type': 'application/json' },
      success: (res) => {
        this.setData({
          aiSummary: res.data?.summary || '今天饮食记录已更新。',
          dinnerSuggestion: res.data?.dinner_suggestion || '晚餐建议清淡、少糖、补充蛋白质。'
        })
      },
      fail: () => {
        this.setData({
          aiSummary: 'AI分析暂时不可用，但你的记录已经保存。',
          dinnerSuggestion: '晚餐建议控制主食量，增加蔬菜和优质蛋白。'
        })
      }
    })
  },

  copyShareText() {
    wx.setClipboardData({
      data: this.data.shareText,
      success: () => wx.showToast({ title: '打卡文案已复制' })
    })
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  }
})
