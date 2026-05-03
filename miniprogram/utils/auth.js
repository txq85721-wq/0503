const app = getApp()

function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error('微信登录失败'))
          return
        }

        wx.request({
          url: `${app.globalData.apiBaseUrl}/auth/wechat-login`,
          method: 'POST',
          data: { code: loginRes.code },
          header: { 'content-type': 'application/json' },
          success(res) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              wx.setStorageSync('openid', res.data.openid)
              wx.setStorageSync('sessionKey', res.data.session_key || '')
              resolve(res.data)
            } else {
              reject(new Error(res.data?.error || '登录失败'))
            }
          },
          fail(err) {
            reject(err)
          }
        })
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function getOpenid() {
  return wx.getStorageSync('openid')
}

module.exports = { login, getOpenid }
