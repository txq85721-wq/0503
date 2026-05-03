const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('only image allowed'))
    cb(null, true)
  }
})
const { recognizeFood } = require('../services/visionService')

router.post('/', upload.single('image'), async (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'no file' })

  try {
    const result = await recognizeFood(file.path)
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: 'recognize failed' })
  } finally {
    fs.unlink(file.path, () => {})
  }
})

module.exports = router
