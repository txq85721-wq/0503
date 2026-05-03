Page({
  data: {
    height: '',
    weight: '',
    goal: '',
    preference: ''
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  saveProfile() {
    wx.setStorageSync('profile', this.data)
    wx.showToast({ title: '已保存' })
  },

  onLoad() {
    const data = wx.getStorageSync('profile')
    if (data) this.setData(data)
  }
})
