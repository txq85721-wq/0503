Page({
  data: {
    foodName: '',
    calories: '',
    records: [],
    totalCalories: 0
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  addRecord() {
    const { foodName, calories, records } = this.data
    if (!foodName || !calories) {
      wx.showToast({ title: '请输入完整', icon: 'none' })
      return
    }

    const newRecord = {
      foodName,
      calories: Number(calories)
    }

    const newRecords = [...records, newRecord]
    const totalCalories = newRecords.reduce((sum, r) => sum + r.calories, 0)

    this.setData({
      records: newRecords,
      totalCalories,
      foodName: '',
      calories: ''
    })

    wx.setStorageSync('records', newRecords)
  },

  onLoad() {
    const records = wx.getStorageSync('records') || []
    const totalCalories = records.reduce((sum, r) => sum + r.calories, 0)
    this.setData({ records, totalCalories })
  }
})
