const { chatJson } = require('./textAiService')
const { extractJson } = require('../utils/aiJson')

const USE_REAL_AI = true

async function generatePlan(profile) {
  if (!USE_REAL_AI) {
    return mockPlan(profile)
  }

  try {
    const content = await chatJson({
      provider: profile.aiProvider,
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
      timeout: 60000
    })

    const json = extractJson(content)
    return normalizePlan(json || mockPlan(profile))
  } catch (e) {
    return mockPlan(profile)
  }
}

function buildSystemPrompt() {
  return `
你是 LESSugar 的专业营养推荐引擎，角色是营养师，不是医生。

核心原则：
1. 控糖优先：减少精制糖、含糖饮料、高糖甜点，优先选择低GI主食和高纤维食物。
2. 均衡饮食：每餐包含优质蛋白、蔬菜、适量主食和健康脂肪。
3. 可执行：菜品必须适合中国家庭日常采购和烹饪。
4. 家庭模式必须遵循“一套菜单，按人调整份量”：全家吃同一套菜，方便统一采购和备菜；不要给每个成员设计完全不同的菜。
5. 家庭模式中，差异只体现在份量、主食量、调味限制、加餐和注意事项。
6. 风险提示：遇到糖尿病、孕期、肾病、严重慢病等情况，要提示用户咨询医生或注册营养师。
7. 不做诊断，不替代医疗建议。

你必须只输出合法 JSON，不要输出 Markdown，不要解释，不要添加 JSON 外文本。
`
}

function buildUserPrompt(profile) {
  const mode = profile.mode || '个人'
  const isFamily = mode === '家庭' || mode === 'family'

  return `
请根据用户档案生成 LESSugar 专业版一周饮食计划。

用户档案：
- 身高：${profile.height || '未填写'} cm
- 体重：${profile.weight || '未填写'} kg
- 目标：${profile.goal || '健康饮食'}
- 饮食偏好：${profile.preference || '无特殊偏好'}
- 预算：${profile.budget || '中等'}
- 买菜频率：${profile.shoppingFrequency || '每周2次'}
- 家庭/个人：${mode}
- 家庭人数：${profile.familySize || '未填写'}
- 家庭成员：${profile.familyMembers || '未填写'}
- 忌口/疾病：${profile.restrictions || '未填写'}

${isFamily ? '家庭模式特别要求：全家必须使用同一套菜单，方便统一备菜；不要给不同成员生成完全不同菜品。请为老人、儿童、控糖成员等提供份量和注意事项差异。' : '个人模式要求：从个人营养摄入和目标出发，给出量化建议。'}

输出 JSON 结构必须严格如下：
{
  "plan_type": "${isFamily ? 'family_weekly_menu' : 'personal_weekly_menu'}",
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
  "family_serving_strategy": {
    "enabled": ${isFamily},
    "principle": "一套菜单，按人调整份量",
    "member_adjustments": [
      {
        "member": "成人/老人/儿童/控糖成员",
        "portion_tip": "",
        "carb_tip": "",
        "seasoning_tip": ""
      }
    ]
  },
  "days": [
    {
      "day": "周一",
      "prep_note": "",
      "breakfast": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": "",
        "family_portion_note": ""
      },
      "lunch": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": "",
        "family_portion_note": ""
      },
      "dinner": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": "",
        "family_portion_note": ""
      },
      "snack": {
        "name": "",
        "foods": [""],
        "estimated_calories": 0,
        "reason": "",
        "family_portion_note": ""
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
  "batch_prep_tips": [""],
  "cooking_tips": [""],
  "sugar_control_tips": [""],
  "warnings": [""]
}

要求：
1. days 必须包含 周一 到 周日 共 7 天。
2. 每天早餐、午餐、晚餐、加餐都要有。
3. 菜单要符合控糖和少糖原则。
4. 采购清单要按买菜频率适配。
5. 家庭模式要强调统一采购、统一备菜、不同成员份量调整。
6. 数值可以估算，但必须合理。
7. 如果信息不足，使用保守估算并在 warnings 里说明。
`
}

function normalizePlan(plan) {
  return {
    plan_type: plan.plan_type || 'personal_weekly_menu',
    target: plan.target || '健康饮食',
    summary: plan.summary || '',
    daily_calorie_target: Number(plan.daily_calorie_target || 0),
    nutrition_targets: plan.nutrition_targets || {},
    family_serving_strategy: plan.family_serving_strategy || null,
    days: Array.isArray(plan.days) ? plan.days : [],
    shopping_list: Array.isArray(plan.shopping_list) ? plan.shopping_list : [],
    batch_prep_tips: Array.isArray(plan.batch_prep_tips) ? plan.batch_prep_tips : [],
    cooking_tips: Array.isArray(plan.cooking_tips) ? plan.cooking_tips : [],
    sugar_control_tips: Array.isArray(plan.sugar_control_tips) ? plan.sugar_control_tips : [],
    warnings: Array.isArray(plan.warnings) ? plan.warnings : []
  }
}

function mockPlan(profile) {
  const isFamily = profile.mode === '家庭' || profile.mode === 'family'

  return {
    plan_type: isFamily ? 'family_weekly_menu' : 'personal_weekly_menu',
    target: profile.goal || '控糖健康饮食',
    summary: isFamily ? '家庭模式：一套菜单，全家共享，按成员调整份量。' : '当前为未配置 AI Key 时的备用计划。',
    daily_calorie_target: 1800,
    nutrition_targets: {
      protein_g: 100,
      fat_g: 55,
      carbs_g: 210,
      sugar_limit_g: 25,
      fiber_g: 25
    },
    family_serving_strategy: isFamily ? {
      enabled: true,
      principle: '一套菜单，按人调整份量',
      member_adjustments: [
        { member: '成人', portion_tip: '正常份量', carb_tip: '主食一拳左右', seasoning_tip: '少油少盐' },
        { member: '儿童', portion_tip: '约成人的二分之一到三分之二', carb_tip: '保留适量主食', seasoning_tip: '避免辛辣' },
        { member: '控糖成员', portion_tip: '增加蔬菜和蛋白质', carb_tip: '主食减量，优先杂粮', seasoning_tip: '不加糖' }
      ]
    } : null,
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => ({
      day,
      prep_note: '可提前备好鸡胸肉、绿叶菜和杂粮饭，分装冷藏。',
      breakfast: {
        name: '鸡蛋燕麦早餐',
        foods: ['鸡蛋', '无糖燕麦', '无糖牛奶'],
        estimated_calories: 420,
        reason: '高蛋白、高纤维、低添加糖',
        family_portion_note: isFamily ? '儿童减半，控糖成员燕麦减量。' : ''
      },
      lunch: {
        name: '鸡胸肉糙米饭',
        foods: ['鸡胸肉', '糙米饭', '西兰花'],
        estimated_calories: 620,
        reason: '优质蛋白搭配低GI主食',
        family_portion_note: isFamily ? '全家同菜，控糖成员糙米减量，蔬菜加量。' : ''
      },
      dinner: {
        name: '清蒸鱼配蔬菜',
        foods: ['鱼', '绿叶菜', '豆腐'],
        estimated_calories: 560,
        reason: '晚餐清淡，控制油脂和精制碳水',
        family_portion_note: isFamily ? '老人少盐，儿童去刺，控糖成员不额外加主食。' : ''
      },
      snack: {
        name: '坚果酸奶',
        foods: ['无糖酸奶', '坚果'],
        estimated_calories: 180,
        reason: '避免含糖零食',
        family_portion_note: isFamily ? '儿童坚果需注意过敏和呛咳风险。' : ''
      },
      daily_tips: ['不喝含糖饮料', '主食控制在一拳左右']
    })),
    shopping_list: [
      {
        category: '蛋白质',
        items: [
          { name: '鸡蛋', amount: isFamily ? '28个' : '14个', buying_tip: '早餐和加餐使用' },
          { name: '鸡胸肉', amount: isFamily ? '2kg' : '1kg', buying_tip: '可分装冷冻' },
          { name: '鱼', amount: isFamily ? '2kg' : '1kg', buying_tip: '选择少刺鱼更方便' }
        ]
      },
      {
        category: '蔬菜',
        items: [
          { name: '西兰花', amount: isFamily ? '6颗' : '3颗', buying_tip: '焯水后冷藏' },
          { name: '绿叶菜', amount: isFamily ? '4kg' : '2kg', buying_tip: '分两次购买更新鲜' }
        ]
      }
    ],
    batch_prep_tips: ['鸡胸肉提前腌制分装', '杂粮饭按餐盒分装', '绿叶菜分两次采购保持新鲜'],
    cooking_tips: ['少油少盐', '优先蒸、煮、炖'],
    sugar_control_tips: ['避免奶茶、果汁、甜点', '主食优先选择糙米、燕麦、杂粮'],
    warnings: ['本计划为健康管理建议，不替代医疗诊断。']
  }
}

module.exports = { generatePlan }
