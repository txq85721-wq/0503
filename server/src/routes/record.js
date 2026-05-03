const express = require('express')
const router = express.Router()
const pool = require('../db')

function localDateString(date = new Date()) {
  const offsetMinutes = Number(process.env.TIMEZONE_OFFSET_MINUTES || 480)
  const local = new Date(date.getTime() + offsetMinutes * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

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

router.get('/today', async (req, res) => {
  const { openid } = req.query
  if (!openid) return res.status(400).json({ error: 'openid required' })

  const today = localDateString()

  try {
    const [rows] = await pool.query(
      `SELECT * FROM records
       WHERE openid = ?
       AND DATE(CONVERT_TZ(created_at, '+00:00', ?)) = ?
       ORDER BY created_at DESC`,
      [openid, process.env.TIMEZONE_SQL_OFFSET || '+08:00', today]
    )

    const summary = rows.reduce((acc, r) => {
      acc.calories += Number(r.calories || 0)
      acc.protein += Number(r.protein || 0)
      return acc
    }, { calories: 0, protein: 0 })

    res.json({ date: today, records: rows, summary })
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

router.get('/summary', async (req, res) => {
  const { openid, days = 7 } = req.query
  if (!openid) return res.status(400).json({ error: 'openid required' })

  try {
    const [rows] = await pool.query(
      `SELECT DATE(CONVERT_TZ(created_at, '+00:00', ?)) AS date,
              SUM(calories) AS calories,
              SUM(protein) AS protein
       FROM records
       WHERE openid = ?
       GROUP BY DATE(CONVERT_TZ(created_at, '+00:00', ?))
       ORDER BY date DESC
       LIMIT ?`,
      [process.env.TIMEZONE_SQL_OFFSET || '+08:00', openid, process.env.TIMEZONE_SQL_OFFSET || '+08:00', Number(days)]
    )

    res.json(rows.reverse())
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

module.exports = router
