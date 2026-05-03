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
    checkinText: '今日未打卡'
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
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
  }
})
