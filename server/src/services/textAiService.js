const axios = require('axios')
require('dotenv').config()

function getTextAiConfig() {
  const provider = (process.env.TEXT_AI_PROVIDER || 'deepseek').toLowerCase()

  if (provider === 'qwen') {
    return {
      provider,
      apiUrl: process.env.QWEN_TEXT_API_URL || `${process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`,
      apiKey: process.env.QWEN_API_KEY,
      model: process.env.QWEN_TEXT_MODEL || process.env.QWEN_MODEL || 'qwen-plus'
    }
  }

  return {
    provider: 'deepseek',
    apiUrl: process.env.DEEPSEEK_API_URL || process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY,
    model: process.env.DEEPSEEK_MODEL || process.env.AI_MODEL || 'deepseek-v4'
  }
}

async function chatJson({ messages, temperature = 0.35, timeout = 60000 }) {
  const config = getTextAiConfig()
  if (!config.apiKey) throw new Error(`${config.provider} api key missing`)

  const body = {
    model: config.model,
    messages,
    temperature
  }

  if (config.provider === 'deepseek') {
    body.response_format = { type: 'json_object' }
  }

  const response = await axios.post(config.apiUrl, body, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout
  })

  return response.data.choices?.[0]?.message?.content || ''
}

module.exports = { chatJson, getTextAiConfig }
