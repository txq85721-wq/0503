const express = require('express')
const router = express.Router()
const { generateDailyInsight } = require('../services/insightService')

router.post('/daily', async (req, res) => {
  try {
    const result = await generateDailyInsight(req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || '生成每日分析失败' })
  }
})

module.exports = router
