const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

const BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const MODEL = process.env.QWEN_MODEL || 'qwen3-vl-flash'

async function recognizeFood(imagePath) {
  // 修复：把本地文件转 base64，而不是当 URL
  const base64 = fs.readFileSync(imagePath, 'base64')

  const response = await axios.post(
    `${BASE_URL}/chat/completions`,
    {
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: '识别图片中的食物，并返回JSON格式：{"foods":[{"name":"","grams":100}]}' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ]
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  )

  const content = response.data.choices?.[0]?.message?.content || ''

  try {
    return JSON.parse(content)
  } catch (e) {
    return { foods: [] }
  }
}

module.exports = { recognizeFood }
