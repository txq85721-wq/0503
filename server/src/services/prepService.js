const axios = require('axios')
require('dotenv').config()

async function generatePrepPlan(data) {
  const { planSummary } = data

  const prompt = `
你是一个家庭饮食备菜规划AI。

用户一周菜单概况：
${planSummary}

请生成“家庭备菜计划”，输出JSON：
{
  "weekly_prep_plan": [
    {"day": "周日", "tasks": [""]}
  ],
  "daily_quick_actions": [""],
  "storage_tips": [""]
}

要求：
- 适合家庭统一备菜
- 减少每日烹饪时间
- 合理安排冷藏/冷冻
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
    return {
      weekly_prep_plan: [
        { day: '周日', tasks: ['准备基础食材', '分装冷藏'] }
      ],
      daily_quick_actions: ['加热食材', '简单翻炒'],
      storage_tips: ['冷藏2-3天内食用']
    }
  }
}

module.exports = { generatePrepPlan }
