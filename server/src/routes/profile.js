const express = require('express')
const router = express.Router()
const pool = require('../db')

router.post('/save', async (req, res) => {
  const { openid, profile } = req.body
  if (!openid || !profile) return res.status(400).json({ error: 'invalid params' })

  try {
    await pool.query(
      `INSERT INTO profiles (openid, height, weight, goal, preference, budget, shopping_frequency, mode, family_size, family_members, restrictions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       height=?, weight=?, goal=?, preference=?, budget=?, shopping_frequency=?, mode=?, family_size=?, family_members=?, restrictions=?`,
      [
        openid,
        profile.height,
        profile.weight,
        profile.goal,
        profile.preference,
        profile.budget,
        profile.shoppingFrequency,
        profile.mode,
        profile.familySize,
        JSON.stringify(profile.familyMembers || []),
        profile.restrictions,
        profile.height,
        profile.weight,
        profile.goal,
        profile.preference,
        profile.budget,
        profile.shoppingFrequency,
        profile.mode,
        profile.familySize,
        JSON.stringify(profile.familyMembers || []),
        profile.restrictions
      ]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'db error' })
  }
})

module.exports = router
