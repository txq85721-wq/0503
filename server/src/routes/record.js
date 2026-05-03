const express = require('express')
const router = express.Router()
const pool = require('../db')

router.post('/add', async (req, res) => {
  const { openid, record } = req.body
  if (!openid || !record) return res.status(400).json({ error: 'invalid params' })

  try {
    await pool.query(
      'INSERT INTO records (openid, food_name, grams, calories, protein, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        openid,
        record.foodName,
        record.grams || 0,
        record.calories || 0,
        record.protein || 0,
        record.source || 'manual',
        record.createdAt || new Date()
      ]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

router.get('/list', async (req, res) => {
  const { openid } = req.query
  if (!openid) return res.status(400).json({ error: 'openid required' })

  try {
    const [rows] = await pool.query('SELECT * FROM records WHERE openid = ? ORDER BY created_at DESC LIMIT 100', [openid])
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

module.exports = router
