const express = require('express')
const router = express.Router()
const { saveUserSetting } = require('../services/reminderService')

router.post('/enable', (req, res) => {
  const { openid, enabled } = req.body

  saveUserSetting(openid, { reminderEnabled: enabled })

  res.json({ success: true })
})

module.exports = router
