const express = require('express')
const router = express.Router()
const pool = require('../db')

router.post('/update', async (req, res) => {
  const { openid } = req.body
  if (!openid) return res.status(400).json({ error: 'openid required' })

  const today = new Date().toISOString().slice(0,10)

  try {
    const [[row]] = await pool.query('SELECT * FROM checkins WHERE openid=?', [openid])

    let streak = 1
    if (row) {
      const last = row.last_date
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10)
      streak = last === yesterday ? row.streak + 1 : 1
    }

    await pool.query(
      'INSERT INTO checkins (openid, streak, last_date) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE streak=?, last_date=?',
      [openid, streak, today, streak, today]
    )

    res.json({ streak })
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

module.exports = router
