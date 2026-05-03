const { calculateNutrition, foodDB } = require('../../utils/foodDB')
const app = getApp()

Page({
  data: {
    foodName: '',
    grams: '',
    records: [],
    totalCalories: 0,
    totalProtein: 0,
    foodList: Object.keys(foodDB),
    recognizing: false
  },

  onSelectFood(e) {
    const index = e.detail.value
    const foodName = this.data.foodList[index]
    this.setData({ foodName })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  addRecord() {
    const { foodName, grams } = this.data
    this.addFoodRecord(foodName, Number(grams), 'manual')
  },

  addFoodRecord(foodName, grams, source = 'manual') {
    const { records } = this.data

    if (!foodName || !grams) {
      wx.showToast({ title: '请输入完整', icon: 'none' })
      return false
    }

    const nutrition = calculateNutrition(foodName, Number(grams))
    if (!nutrition) {
      wx.showToast({ title: `${foodName} 暂不支持`, icon: 'none' })
      return false
    }

    const newRecord = {
      foodName,
      grams: Number(grams),
      calories: nutrition.calories,
      protein: nutrition.protein,
      source,
      createdAt: new Date().toISOString()
    }

    const newRecords = [...records, newRecord]
    this.refreshRecords(newRecords)

    this.setData({ foodName: '', grams: '' })
    wx.setStorageSync('records', newRecords)
    return true
  },

  refreshRecords(records) {
    const totalCalories = records.reduce((sum, r) => sum + Number(r.calories || 0), 0)
    const totalProtein = records.reduce((sum, r) => sum + Number(r.protein || 0), 0)
    this.setData({ records, totalCalories, totalProtein })
  },

  takePhoto() {
    wx.chooseImage({
      count: 1,
      sourceType: ['camera', 'album'],
      success: (res) => {
        const filePath = res.tempFilePaths[0]
        this.uploadFoodImage(filePath)
      }
    })
  },

  uploadFoodImage(filePath) {
    this.setData({ recognizing: true })

    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}/recognize`,
      filePath,
      name: 'image',
      success: (uploadRes) => {
        try {
          const data = JSON.parse(uploadRes.data)
          const foods = data.foods || []

          if (!foods.length) {
            wx.showToast({ title: '未识别到食物', icon: 'none' })
            return
          }

          let addedCount = 0
          foods.forEach(food => {
            const ok = this.addFoodRecord(food.name, food.grams || 100, 'photo')
            if (ok) addedCount += 1
          })

          wx.showToast({ title: `已记录${addedCount}项` })
        } catch (err) {
          wx.showToast({ title: '识别结果异常', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '上传失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ recognizing: false })
      }
    })
  },

  onLoad() {
    const records = wx.getStorageSync('records') || []
    this.refreshRecords(records)
  },

  onShow() {
    const records = wx.getStorageSync('records') || []
    this.refreshRecords(records)
  }
})
