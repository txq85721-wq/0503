const { calculateNutrition, foodDB } = require('../../utils/foodDB')
const { updateCheckin } = require('../../utils/checkin')
const { login, getOpenid } = require('../../utils/auth')
const app = getApp()

Page({
  data: {
    foodName: '',
    grams: '',
    records: [],
    totalCalories: 0,
    totalProtein: 0,
    foodList: Object.keys(foodDB),
    recognizing: false,
    saving: false,
    loadingRecords: false
  },

  async ensureOpenid() {
    let openid = getOpenid()
    if (!openid) {
      const res = await login()
      openid = res.openid
    }
    return openid
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

  async addRecord() {
    const { foodName, grams } = this.data
    const ok = await this.addFoodRecord(foodName, Number(grams), 'manual')
    if (ok) updateCheckin()
  },

  async addFoodRecord(foodName, grams, source = 'manual') {
    if (!foodName || !grams) {
      wx.showToast({ title: '请输入完整', icon: 'none' })
      return false
    }

    const nutrition = calculateNutrition(foodName, Number(grams))
    if (!nutrition) {
      wx.showToast({ title: `${foodName} 暂不支持`, icon: 'none' })
      return false
    }

    const record = {
      foodName,
      grams: Number(grams),
      calories: nutrition.calories,
      protein: nutrition.protein,
      source,
      createdAt: new Date().toISOString()
    }

    try {
      this.setData({ saving: true })
      const openid = await this.ensureOpenid()

      await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.apiBaseUrl}/record/add`,
          method: 'POST',
          data: { openid, record },
          header: { 'content-type': 'application/json' },
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data)
            else reject(new Error(res.data?.error || '保存失败'))
          },
          fail: reject
        })
      })

      this.setData({ foodName: '', grams: '' })
      await this.loadRecords()
      return true
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
      return false
    } finally {
      this.setData({ saving: false })
    }
  },

  normalizeRecord(row) {
    return {
      foodName: row.foodName || row.food_name,
      grams: row.grams || 0,
      calories: Number(row.calories || 0),
      protein: Number(row.protein || 0),
      source: row.source || '',
      createdAt: row.createdAt || row.created_at
    }
  },

  refreshRecords(records) {
    const normalized = records.map(this.normalizeRecord)
    const totalCalories = normalized.reduce((sum, r) => sum + Number(r.calories || 0), 0)
    const totalProtein = normalized.reduce((sum, r) => sum + Number(r.protein || 0), 0)
    this.setData({ records: normalized, totalCalories, totalProtein })
  },

  async loadRecords() {
    try {
      this.setData({ loadingRecords: true })
      const openid = await this.ensureOpenid()

      wx.request({
        url: `${app.globalData.apiBaseUrl}/record/list`,
        method: 'GET',
        data: { openid },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            this.refreshRecords(res.data || [])
          }
        },
        complete: () => {
          this.setData({ loadingRecords: false })
        }
      })
    } catch (e) {
      this.setData({ loadingRecords: false })
      wx.showToast({ title: '加载记录失败', icon: 'none' })
    }
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
      success: async (uploadRes) => {
        try {
          const data = JSON.parse(uploadRes.data)
          const foods = data.foods || []

          if (!foods.length) {
            wx.showToast({ title: '未识别到食物', icon: 'none' })
            return
          }

          let addedCount = 0
          for (const food of foods) {
            const ok = await this.addFoodRecord(food.name, food.grams || 100, 'photo')
            if (ok) addedCount += 1
          }

          if (addedCount > 0) updateCheckin()
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
    this.loadRecords()
  },

  onShow() {
    this.loadRecords()
  }
})
