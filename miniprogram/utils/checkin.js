const { login, getOpenid } = require('./auth')

async function updateCheckin() {
  let openid = getOpenid()
  if (!openid) {
    const res = await login()
    openid = res.openid
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getApp().globalData.apiBaseUrl}/checkin/update`,
      method: 'POST',
      data: { openid },
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

module.exports = { updateCheckin }
