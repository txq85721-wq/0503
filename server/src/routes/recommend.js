const express = require('express')
const router = express.Router()

const { generatePlan } = require('../services/aiService')

router.post('/', async (req, res) => {
  const profile = req.body

  try {
    const result = await generatePlan(profile)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
