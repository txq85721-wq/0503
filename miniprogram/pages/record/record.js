const { calculateNutrition } = require('../../utils/foodDB')

Page({
  data: {
    foodName: '',
    grams: '',
    records: [],
    totalCalories: 0
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  addRecord() {
    const { foodName, grams, records } = this.data
    if (!foodName || !grams) {
      wx.showToast({ title: '请输入完整', icon: 'none' })
      return
    }

    const nutrition = calculateNutrition(foodName, Number(grams))

    if (!nutrition) {
      wx.showToast({ title: '食物不在数据库', icon: 'none' })
      return
    }

    const newRecord = {
      foodName,
      grams,
      calories: nutrition.calories
    }

    const newRecords = [...records, newRecord]
    const totalCalories = newRecords.reduce((sum, r) => sum + r.calories, 0)

    this.setData({
      records: newRecords,
      totalCalories,
      foodName: '',
      grams: ''
    })

    wx.setStorageSync('records', newRecords)
  },

  onLoad() {
    const records = wx.getStorageSync('records') || []
    const totalCalories = records.reduce((sum, r) => sum + r.calories, 0)
    this.setData({ records, totalCalories })
  }
})
