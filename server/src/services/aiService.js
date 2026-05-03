const axios = require('axios')
require('dotenv').config()

const USE_REAL_AI = true

async function generatePlan(profile) {
  if (!USE_REAL_AI) {
    return mockPlan(profile)
  }

  const prompt = buildPrompt(profile)

  const response = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: '你是专业营养师，必须输出JSON格式的饮食计划'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const content = response.data.choices[0].message.content

  try {
    return JSON.parse(content)
  } catch (e) {
    return { raw: content }
  }
}

function buildPrompt(profile) {
  return `
用户信息：
身高:${profile.height}
体重:${profile.weight}
目标:${profile.goal}
偏好:${profile.preference}

请生成：
1. 一天饮食（早餐午餐晚餐）
2. 控糖建议
3. 输出JSON格式：
{
  "breakfast": "",
  "lunch": "",
  "dinner": "",
  "tips": ""
}
`
}

function mockPlan(profile) {
  return {
    target: profile.goal || '健康饮食',
    breakfast: '鸡蛋 + 燕麦 + 牛奶',
    lunch: '鸡胸肉 + 米饭 + 西兰花',
    dinner: '三文鱼 + 沙拉',
    tips: '控制糖分摄入'
  }
}

module.exports = { generatePlan }
