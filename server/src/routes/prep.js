const express = require('express')
const router = express.Router()
const { generatePrepPlan } = require('../services/prepService')

router.post('/', async (req, res) => {
  try {
    const result = await generatePrepPlan(req.body)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message || '生成备菜计划失败' })
  }
})

module.exports = router
