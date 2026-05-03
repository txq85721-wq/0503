const app = getApp()

function requestReminderSubscribe() {
  const tmplId = app.globalData.reminderTemplateId

  if (!tmplId || tmplId === 'YOUR_TEMPLATE_ID') {
    wx.showToast({ title: '请先配置模板ID', icon: 'none' })
    return Promise.resolve(false)
  }

  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success(res) {
        const accepted = res[tmplId] === 'accept'
        wx.setStorageSync('reminderSubscribed', accepted)
        wx.showToast({ title: accepted ? '提醒已开启' : '未开启提醒', icon: 'none' })
        resolve(accepted)
      },
      fail() {
        wx.showToast({ title: '订阅失败', icon: 'none' })
        resolve(false)
      }
    })
  })
}

module.exports = { requestReminderSubscribe }
