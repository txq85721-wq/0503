const { chatJson } = require('./textAiService')
const { extractJson } = require('../utils/aiJson')

async function generateDailyInsight(data) {
  const { totalCalories, targetCalories, totalProtein, aiProvider } = data

  const prompt = `用户今日热量${totalCalories}，目标${targetCalories}，蛋白质${totalProtein}。请输出JSON：{"summary":"一句今日总结","dinner_suggestion":"晚餐建议"}`

  const content = await chatJson({
    provider: aiProvider,
    messages: [{ role: 'user', content: prompt }],
    timeout: 30000
  })

  const json = extractJson(content)

  return json || {
    summary: '今日数据正常',
    dinner_suggestion: '建议晚餐清淡饮食，控制精制碳水。'
  }
}

module.exports = { generateDailyInsight }
