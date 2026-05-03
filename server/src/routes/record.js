const express = require('express')
const router = express.Router()
const pool = require('../db')

router.post('/add', async (req, res) => {
  const { openid, record } = req.body
  if (!openid || !record) return res.status(400).json({ error: 'invalid params' })

  try {
    await pool.query(
      'INSERT INTO records (openid, food_name, calories, protein) VALUES (?, ?, ?, ?)',
      [openid, record.foodName, record.calories, record.protein]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

router.get('/list', async (req, res) => {
  const { openid } = req.query

  try {
    const [rows] = await pool.query('SELECT * FROM records WHERE openid = ?', [openid])
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

module.exports = router
