const { chatJson } = require('./textAiService')

async function generatePrepPlan(data) {
  const { planSummary, aiProvider } = data

  const prompt = `家庭一周菜单：${planSummary}。请输出JSON：{"weekly_prep_plan":[],"daily_quick_actions":[],"storage_tips":[]}`

  const content = await chatJson({
    provider: aiProvider,
    messages: [{ role: 'user', content: prompt }]
  })

  try {
    return JSON.parse(content)
  } catch {
    return {
      weekly_prep_plan: [{ day: '周日', tasks: ['准备基础食材'] }],
      daily_quick_actions: ['简单加热'],
      storage_tips: ['冷藏保存']
    }
  }
}

module.exports = { generatePrepPlan }
