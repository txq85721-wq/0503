const express = require('express')
const router = express.Router()
const { saveUserSetting } = require('../services/reminderService')

router.post('/enable', async (req, res) => {
  const { openid, enabled } = req.body

  if (!openid) {
    return res.status(400).json({ error: 'openid required' })
  }

  try {
    await saveUserSetting(openid, { reminderEnabled: enabled })
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'save failed' })
  }
})

module.exports = router
