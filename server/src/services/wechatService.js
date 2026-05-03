const axios = require('axios')
require('dotenv').config()

let cachedToken = null
let tokenExpireAt = 0

async function getAccessToken() {
  const now = Date.now()
  if (cachedToken && now < tokenExpireAt) return cachedToken

  if (!process.env.WX_APPID || !process.env.WX_SECRET) {
    console.log('WX_APPID or WX_SECRET missing, skip subscribe message')
    return null
  }

  const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: process.env.WX_APPID,
      secret: process.env.WX_SECRET
    },
    timeout: 10000
  })

  cachedToken = res.data.access_token
  tokenExpireAt = now + Math.max((res.data.expires_in || 7200) - 300, 60) * 1000
  return cachedToken
}

async function sendSubscribeMessage({ openid, templateId, data, page = 'pages/index/index' }) {
  if (!openid || !templateId) return { skipped: true }

  const accessToken = await getAccessToken()
  if (!accessToken) return { skipped: true }

  const res = await axios.post(
    `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
    {
      touser: openid,
      template_id: templateId,
      page,
      data
    },
    { timeout: 10000 }
  )

  return res.data
}

module.exports = { sendSubscribeMessage }
