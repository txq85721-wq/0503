const axios = require('axios')
require('dotenv').config()

const USE_REAL_AI = true
const DEEPSEEK_API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = process.env.AI_MODEL || 'deepseek-v4-flash'

async function generatePlan(profile) {
  if (!USE_REAL_AI || !process.env.AI_API_KEY) {
    return mockPlan(profile)
  }

  const response = await axios.post(
    DEEPSEEK_API_URL,
    {
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt()
        },
        {
          role: 'user',
          content: buildUserPrompt(profile)
        }
      ],
      temperature: 0.35,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    }
  )

  const content = response.data.choices?.[0]?.message?.content
  return normalizePlan(JSON.parse(content))
}

function buildSystemPrompt() {
  return `
你是 LESSugar 的专业营养推荐引擎，角色是营养师，不是医生。

核心原则：
1. 控糖优先：减少精制糖、含糖饮料、高糖甜点，优先选择低GI主食和高纤维食物。
2. 均衡饮食：每餐包含优质蛋白、蔬菜、适量主食和健康脂肪。
3. 可执行：菜品必须适合中国家庭日常采购和烹饪。
4. 风险提示：遇到糖尿病、孕期、肾病、严重慢病等情况，要提示用户咨询医生或注册营养师。
5. 不做诊断，不替代医疗建议。

你必须只输出合法 JSON，不要输出 Markdown，不要解释，不要添加 JSON 外文本。
`
}

function buildUserPrompt(profile) {
  return `
请根据用户档案生成 LESSugar 专业版一周饮食计划。

用户档案：
- 身高：${profile.height || '未填写'} cm
- 体重：${profile.weight || '未填写'} kg
- 目标：${profile.goal || '健康饮食'}
- 饮食偏好：${profile.preference || '无特殊偏好'}
- 预算：${profile.budget || '中等'}
- 买菜频率：${profile.shoppingFrequency || '每周2次'}
- 家庭/个人：${profile.mode || '个人'}
- 忌口/疾病：${profile.restrictions || '未填写'}

输出 JSON 结构必须严格如下：
{
  "plan_type": "personal_weekly_menu",
  "target": "",
  "summary": "",
  "daily_calorie_target": 0,
  "nutrition_targets": {
    "protein_g": 0,
    "fat_g": 0,
    "carbs_g": 0,
    "sugar_limit_g": 0,
    "fiber_g": 0
  },
  "days": [
    {
      "day": "周一",
      "breakfast": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": ""
      },
      "lunch": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": ""
      },
      "dinner": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": ""
      },
      "snack": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": ""
      },
      "daily_tips": [""]
    }
  ],
  "shopping_list": [
    {
      "category": "蛋白质",
      "items": [
        { "name": "", "amount": "", "buying_tip": "" }
      ]
    }
  ],
  "cooking_tips": [""],
  "sugar_control_tips": [""],
  "warnings": [""]
}

要求：
1. days 必须包含 周一 到 周日 共 7 天。
2. 每天早餐、午餐、晚餐、加餐都要有。
3. 菜单要符合控糖和少糖原则。
4. 采购清单要按买菜频率适配。
5. 数值可以估算，但必须合理。
6. 如果信息不足，使用保守估算并在 warnings 里说明。
`
}

function normalizePlan(plan) {
  return {
    plan_type: plan.plan_type || 'personal_weekly_menu',
    target: plan.target || '健康饮食',
    summary: plan.summary || '',
    daily_calorie_target: Number(plan.daily_calorie_target || 0),
    nutrition_targets: plan.nutrition_targets || {},
    days: Array.isArray(plan.days) ? plan.days : [],
    shopping_list: Array.isArray(plan.shopping_list) ? plan.shopping_list : [],
    cooking_tips: Array.isArray(plan.cooking_tips) ? plan.cooking_tips : [],
    sugar_control_tips: Array.isArray(plan.sugar_control_tips) ? plan.sugar_control_tips : [],
    warnings: Array.isArray(plan.warnings) ? plan.warnings : []
  }
}

function mockPlan(profile) {
  return {
    plan_type: 'personal_weekly_menu',
    target: profile.goal || '控糖健康饮食',
    summary: '当前为未配置 AI_API_KEY 时的备用计划。',
    daily_calorie_target: 1800,
    nutrition_targets: {
      protein_g: 100,
      fat_g: 55,
      carbs_g: 210,
      sugar_limit_g: 25,
      fiber_g: 25
    },
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => ({
      day,
      breakfast: {
        name: '鸡蛋燕麦早餐',
        foods: ['鸡蛋', '无糖燕麦', '无糖牛奶'],
        estimated_calories: 420,
        reason: '高蛋白、高纤维、低添加糖'
      },
      lunch: {
        name: '鸡胸肉糙米饭',
        foods: ['鸡胸肉', '糙米饭', '西兰花'],
        estimated_calories: 620,
        reason: '优质蛋白搭配低GI主食'
      },
      dinner: {
        name: '清蒸鱼配蔬菜',
        foods: ['鱼', '绿叶菜', '豆腐'],
        estimated_calories: 560,
        reason: '晚餐清淡，控制油脂和精制碳水'
      },
      snack: {
        name: '坚果酸奶',
        foods: ['无糖酸奶', '坚果'],
        estimated_calories: 180,
        reason: '避免含糖零食'
      },
      daily_tips: ['不喝含糖饮料', '主食控制在一拳左右']
    })),
    shopping_list: [
      {
        category: '蛋白质',
        items: [
          { name: '鸡蛋', amount: '14个', buying_tip: '早餐和加餐使用' },
          { name: '鸡胸肉', amount: '1kg', buying_tip: '可分装冷冻' },
          { name: '鱼', amount: '1kg', buying_tip: '选择少刺鱼更方便' }
        ]
      },
      {
        category: '蔬菜',
        items: [
          { name: '西兰花', amount: '3颗', buying_tip: '焯水后冷藏' },
          { name: '绿叶菜', amount: '2kg', buying_tip: '分两次购买更新鲜' }
        ]
      }
    ],
    cooking_tips: ['少油少盐', '优先蒸、煮、炖'],
    sugar_control_tips: ['避免奶茶、果汁、甜点', '主食优先选择糙米、燕麦、杂粮'],
    warnings: ['本计划为健康管理建议，不替代医疗诊断。']
  }
}

module.exports = { generatePlan }
