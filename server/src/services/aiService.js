const axios = require('axios')

// 是否启用真实AI
const USE_REAL_AI = false

async function generatePlan(profile) {
  if (!USE_REAL_AI) {
    return mockPlan(profile)
  }

  // TODO: 替换为真实AI调用
  return mockPlan(profile)
}

function mockPlan(profile) {
  return {
    target: profile.goal || '健康饮食',
    breakfast: '鸡蛋 + 燕麦 + 牛奶',
    lunch: '鸡胸肉 + 米饭 + 西兰花',
    dinner: '三文鱼 + 沙拉',
    tips: '控制糖分摄入，避免含糖饮料'
  }
}

module.exports = { generatePlan }
