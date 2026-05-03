# API 设计

## 推荐接口

POST /api/recommend

请求：
{
  "height": 170,
  "weight": 65,
  "goal": "减脂",
  "preference": "清淡"
}

响应：
{
  "breakfast": "...",
  "lunch": "...",
  "dinner": "...",
  "tips": "..."
}
