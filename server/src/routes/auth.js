const express = require('express')
const router = express.Router()
const axios = require('axios')
const pool = require('../db')

router.post('/wechat-login', async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'code required' })

  try {
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WX_APPID,
        secret: process.env.WX_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      },
      timeout: 10000
    })

    const { openid, session_key, errcode, errmsg } = wxRes.data
    if (errcode || !openid) {
      return res.status(400).json({ error: errmsg || '微信登录失败' })
    }

    await pool.query(
      'INSERT INTO users (openid) VALUES (?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP',
      [openid]
    )

    res.json({ openid, session_key })
  } catch (err) {
    res.status(500).json({ error: '微信登录失败' })
  }
})

module.exports = router
