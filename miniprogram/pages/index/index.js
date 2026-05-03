const { getCheckin } = require('../../utils/checkin')

Page({
  data: {
    todayCalories: 0,
    remainingCalories: 0,
    targetCalories: 1800,
    progressPercent: 0,
    advice: '',
    streak: 0,
    checkedToday: false,
    checkinText: '今日未打卡',
    aiSummary: '',
    dinnerSuggestion: '',
    insightLoading: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
    this.loadAIInsight()
  },

  loadData() {
    const records = wx.getStorageSync('records') || []
    const plan = wx.getStorageSync('latestPlan') || {}
    const checkin = getCheckin()

    const todayCalories = records.reduce((sum, r) => sum + Number(r.calories || 0), 0)
    const targetCalories = plan.daily_calorie_target || 1800
    const remainingCalories = targetCalories - todayCalories
    const progressPercent = Math.min(Math.round((todayCalories / targetCalories) * 100), 100)

    const advice = remainingCalories > 0
      ? '可以适量补充蛋白质和低糖食物，继续保持少糖饮食。'
      : '已超过建议摄入，今天剩余时间建议减少高热量和高糖食物。'

    this.setData({
      todayCalories,
      targetCalories,
      remainingCalories,
      progressPercent,
      advice,
      streak: checkin.streak || 0,
      checkedToday: checkin.checkedToday,
      checkinText: checkin.checkedToday ? '今日已打卡' : '今日未打卡'
    })
  },

  loadAIInsight() {
    const records = wx.getStorageSync('records') || []
    const plan = wx.getStorageSync('latestPlan') || {}

    const totalCalories = records.reduce((sum, r) => sum + Number(r.calories || 0), 0)
    const totalProtein = records.reduce((sum, r) => sum + Number(r.protein || 0), 0)
    const targetCalories = plan.daily_calorie_target || 1800

    if (!records.length) {
      this.setData({
        aiSummary: '今天还没有饮食记录，先记录一餐，LESSugar 会给你生成个性化反馈。',
        dinnerSuggestion: '建议从早餐或午餐开始记录，优先选择低糖、高蛋白食物。'
      })
      return
    }

    this.setData({ insightLoading: true })

    wx.request({
      url: `${getApp().globalData.apiBaseUrl}/insight/daily`,
      method: 'POST',
      data: {
        totalCalories,
        targetCalories,
        totalProtein
      },
      header: { 'content-type': 'application/json' },
      success: (res) => {
        this.setData({
          aiSummary: res.data.summary || '今天饮食记录已更新。',
          dinnerSuggestion: res.data.dinner_suggestion || '晚餐建议清淡、少糖、补充蛋白质。'
        })
      },
      fail: () => {
        this.setData({
          aiSummary: 'AI分析暂时不可用，但你的记录已经保存。',
          dinnerSuggestion: '晚餐建议控制主食量，增加蔬菜和优质蛋白。'
        })
      },
      complete: () => {
        this.setData({ insightLoading: false })
      }
    })
  }
})
