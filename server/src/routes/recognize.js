const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const { recognizeFood } = require('../services/visionService')

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'no file' })

    // 简化：直接用本地路径（生产建议上传OSS/CDN）
    const result = await recognizeFood(file.path)
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: 'recognize failed' })
  }
})

module.exports = router
