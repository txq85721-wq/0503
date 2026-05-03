const express = require('express')
const router = express.Router()
const axios = require('axios')

router.post('/wechat-login', async (req, res) => {
  const { code } = req.body

  try {
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WX_APPID,
        secret: process.env.WX_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, session_key } = wxRes.data

    res.json({ openid, session_key })
  } catch (err) {
    res.status(500).json({ error: '微信登录失败' })
  }
})

module.exports = router
