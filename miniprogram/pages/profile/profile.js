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
    aiProvider: 'deepseek',
    aiProviderOptions: [
      { label: 'DeepSeek', value: 'deepseek', desc: '适合中文饮食分析和菜单规划' },
      { label: 'ChatGPT', value: 'chatgpt', desc: '适合更自然的建议和解释' },
      { label: '千问', value: 'qwen', desc: '适合中文场景，可与图像识别生态配合' }
    ],
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

  selectAiProvider(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ aiProvider: value })
    wx.setStorageSync('aiProvider', value)
    wx.showToast({ title: 'AI模型已切换' })
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
      wx.setStorageSync('aiProvider', this.data.aiProvider)

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
    const aiProvider = wx.getStorageSync('aiProvider') || 'deepseek'
    if (data) this.setData(data)
    this.setData({ aiProvider })
  }
})
