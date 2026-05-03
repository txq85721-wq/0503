Page({
  data: {
    todayCalories: 0,
    remainingCalories: 0,
    targetCalories: 1800,
    advice: ''
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

    const todayCalories = records.reduce((sum, r) => sum + r.calories, 0)
    const targetCalories = plan.daily_calorie_target || 1800
    const remainingCalories = targetCalories - todayCalories

    const advice = remainingCalories > 0
      ? '可以适量补充蛋白质和低糖食物'
      : '已超过建议摄入，请减少高热量食物'

    this.setData({
      todayCalories,
      targetCalories,
      remainingCalories,
      advice
    })
  }
})
