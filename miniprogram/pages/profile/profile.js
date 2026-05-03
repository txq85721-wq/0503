const { login, getOpenid } = require('../../utils/auth')
const app = getApp()

Page({
  data: {
    height: '',
    weight: '',
    goal: '',
    preference: '',
    budget: '',
    shoppingFrequency: '',
    mode: '个人',
    familySize: '',
    familyMembers: '',
    restrictions: '',
    saving: false
  },

  async ensureOpenid() {
    let openid = getOpenid()
    if (!openid) {
      const res = await login()
      openid = res.openid
    }
    return openid
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  async saveProfile() {
    try {
      this.setData({ saving: true })
      const openid = await this.ensureOpenid()
      const profile = {
        height: this.data.height,
        weight: this.data.weight,
        goal: this.data.goal,
        preference: this.data.preference,
        budget: this.data.budget,
        shoppingFrequency: this.data.shoppingFrequency,
        mode: this.data.mode,
        familySize: this.data.familySize,
        familyMembers: this.data.familyMembers,
        restrictions: this.data.restrictions
      }

      wx.setStorageSync('profile', profile)

      wx.request({
        url: `${app.globalData.apiBaseUrl}/profile/save`,
        method: 'POST',
        data: { openid, profile },
        header: { 'content-type': 'application/json' },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            wx.showToast({ title: '已保存' })
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        },
        fail: () => wx.showToast({ title: '保存失败', icon: 'none' }),
        complete: () => this.setData({ saving: false })
      })
    } catch (e) {
      this.setData({ saving: false })
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  onLoad() {
    const data = wx.getStorageSync('profile')
    if (data) this.setData(data)
  }
})
