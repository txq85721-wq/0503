// 简易食物营养数据库（每100g）
const foodDB = {
  鸡胸肉: { calories: 165, protein: 31 },
  米饭: { calories: 130, protein: 2.5 },
  鸡蛋: { calories: 155, protein: 13 },
  燕麦: { calories: 389, protein: 16 },
  牛奶: { calories: 60, protein: 3.2 },
  西兰花: { calories: 34, protein: 2.8 },
  三文鱼: { calories: 208, protein: 20 }
}

function calculateNutrition(name, grams) {
  const food = foodDB[name]
  if (!food) return null

  const factor = grams / 100
  return {
    calories: Math.round(food.calories * factor),
    protein: Math.round(food.protein * factor)
  }
}

module.exports = { foodDB, calculateNutrition }
