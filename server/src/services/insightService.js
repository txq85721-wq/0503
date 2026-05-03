const axios = require('axios')
const { extractJson } = require('../utils/aiJson')
require('dotenv').config()

const API_URL = process.env.AI_API_URL
const API_KEY = process.env.AI_API_KEY
const MODEL = process.env.AI_MODEL

async function generateDailyInsight(data) {
  const { totalCalories, targetCalories, totalProtein } = data

  const prompt = `用户今日热量${totalCalories}，目标${targetCalories}，蛋白质${totalProtein}，给总结和晚餐建议(JSON)`

  const res = await axios.post(
    API_URL,
    {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: { Authorization: `Bearer ${API_KEY}` }
    }
  )

  const content = res.data.choices?.[0]?.message?.content
  const json = extractJson(content)

  return json || {
    summary: '今日数据正常',
    dinner_suggestion: '清淡饮食'
  }
}

module.exports = { generateDailyInsight }
