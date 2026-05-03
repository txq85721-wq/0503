const { getCheckin, formatDate } = require('../../utils/checkin')

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
    insightLoading: false,
    calorieChart: [],
    proteinChart: [],
    maxCalories: 1800,
    proteinTarget: 100
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

    const proteinTarget = plan.nutrition_targets?.protein_g || 100
    const chartData = this.buildCharts(records, targetCalories, proteinTarget)

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
      checkinText: checkin.checkedToday ? '今日已打卡' : '今日未打卡',
      proteinTarget,
      ...chartData
    })
  },

  buildCharts(records, targetCalories, proteinTarget) {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const key = formatDate(date)
      const label = i === 0 ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`
      days.push({ key, label, calories: 0, protein: 0 })
    }

    records.forEach(record => {
      const dateKey = record.createdAt ? record.createdAt.slice(0, 10) : formatDate()
      const day = days.find(d => d.key === dateKey)
      if (!day) return
      day.calories += Number(record.calories || 0)
      day.protein += Number(record.protein || 0)
    })

    const maxCalories = Math.max(targetCalories, ...days.map(d => d.calories), 1)

    return {
      maxCalories,
      calorieChart: days.map(d => ({
        ...d,
        barHeight: Math.max(Math.round((d.calories / maxCalories) * 180), d.calories > 0 ? 12 : 4),
        percent: Math.min(Math.round((d.calories / targetCalories) * 100), 120)
      })),
      proteinChart: days.map(d => ({
        ...d,
        percent: Math.min(Math.round((d.protein / proteinTarget) * 100), 100)
      }))
    }
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
