const axios = require('axios')
require('dotenv').config()

async function generateDailyInsight(data) {
  const { totalCalories, targetCalories, totalProtein } = data

  const prompt = `
你是一个健康饮食AI。
用户今日数据：
- 摄入热量：${totalCalories}
- 目标热量：${targetCalories}
- 蛋白质：${totalProtein}

请输出JSON：
{
  "summary": "一句总结",
  "dinner_suggestion": "晚餐建议"
}
`

  const res = await axios.post(
    process.env.DEEPSEEK_API_URL,
    {
      model: process.env.DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      }
    }
  )

  const content = res.data.choices[0].message.content

  try {
    return JSON.parse(content)
  } catch {
    return { summary: '今天饮食还不错，继续保持。', dinner_suggestion: '建议晚餐清淡。' }
  }
}

module.exports = { generateDailyInsight }
