const app = getApp()

function request({ url, method = 'GET', data = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(res.data?.error || '请求失败'))
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

module.exports = { request }
