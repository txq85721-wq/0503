const express = require('express')
const router = express.Router()
const pool = require('../db')

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

router.post('/update', async (req, res) => {
  const { openid } = req.body
  if (!openid) return res.status(400).json({ error: 'openid required' })

  const today = todayString()

  try {
    const [[row]] = await pool.query('SELECT * FROM checkins WHERE openid=?', [openid])

    if (row && String(row.last_date).slice(0, 10) === today) {
      return res.json({ streak: row.streak, checkedToday: true })
    }

    let streak = 1
    if (row) {
      const last = String(row.last_date).slice(0, 10)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      streak = last === yesterday ? row.streak + 1 : 1
    }

    await pool.query(
      'INSERT INTO checkins (openid, streak, last_date) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE streak=?, last_date=?',
      [openid, streak, today, streak, today]
    )

    res.json({ streak, checkedToday: true })
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

router.get('/status', async (req, res) => {
  const { openid } = req.query
  if (!openid) return res.status(400).json({ error: 'openid required' })

  try {
    const [[row]] = await pool.query('SELECT * FROM checkins WHERE openid=?', [openid])
    const today = todayString()

    res.json({
      streak: row?.streak || 0,
      checkedToday: row ? String(row.last_date).slice(0, 10) === today : false
    })
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

module.exports = router
