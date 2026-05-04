# LESSugar

LESSugar 是一个微信小程序健康饮食管理项目，面向个人和家庭场景，核心目标是：少糖、科学饮食、长期记录、个性化推荐。

## 项目定位

- 个人健康饮食管理
- 家庭周期性菜单推荐
- AI 饮食和营养建议
- 饮食、运动、体重打卡
- 食物拍照识别与营养估算
- 采购清单与周期菜单规划

## 项目结构

```text
LESSugar/
├── miniprogram/     微信小程序前端
├── server/          Node.js + Express 后端服务
├── server/sql/      MySQL 初始化 SQL
├── docs/            产品、接口、AI 提示词文档
└── README.md
```

## 技术栈

- 前端：微信小程序
- 后端：Node.js + Express
- 数据库：MySQL
- AI：
  - 食物图像识别：千问 VL，默认 `qwen3-vl-flash`
  - 文本 AI：DeepSeek / ChatGPT / 千问，可由用户前端选择
- 推送：微信订阅消息

---

# 上线部署指南

## 1. 上线前必须修改的参数清单

### 1.1 小程序前端参数

文件：

```text
miniprogram/app.js
```

需要修改：

```js
apiBaseUrl: 'https://your-domain.com/api'
```

改成你的真实后端 HTTPS API 地址，例如：

```js
apiBaseUrl: 'https://api.yourdomain.com/api'
```

注意：微信小程序正式环境必须使用 HTTPS 域名，不能直接使用 IP 或 HTTP。

---

### 1.2 后端环境变量

在服务器的 `server/` 目录下创建 `.env` 文件。可以参考：

```text
server/.env.example
```

必须配置：

```env
PORT=3000

DB_HOST=127.0.0.1
DB_USER=lessugar
DB_PASSWORD=your_password
DB_NAME=lessugar

DEEPSEEK_API_KEY=your_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-v4

OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o

QWEN_API_KEY=your_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_TEXT_MODEL=qwen-plus
QWEN_MODEL=qwen3-vl-flash

TEXT_AI_PROVIDER=deepseek
TIMEZONE_OFFSET_MINUTES=480
TIMEZONE_SQL_OFFSET=+08:00
CORS_ORIGIN=https://api.yourdomain.com,https://yourdomain.com

WX_APPID=your_appid
WX_SECRET=your_secret
WX_TEMPLATE_ID=your_template_id
```

参数说明：

| 参数 | 说明 |
|---|---|
| `PORT` | 后端服务监听端口，默认 3000 |
| `DB_HOST` | MySQL 地址 |
| `DB_USER` | MySQL 用户名 |
| `DB_PASSWORD` | MySQL 密码 |
| `DB_NAME` | MySQL 数据库名 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `DEEPSEEK_MODEL` | DeepSeek 文本模型，默认建议 `deepseek-v4` |
| `OPENAI_API_KEY` | OpenAI API Key，用于 ChatGPT 模型 |
| `OPENAI_MODEL` | OpenAI 模型，建议 `gpt-4o` 或 `gpt-4o-mini` |
| `QWEN_API_KEY` | 千问 API Key，用于 VL 识别和可选文本模型 |
| `QWEN_MODEL` | 千问 VL 模型，默认 `qwen3-vl-flash` |
| `QWEN_TEXT_MODEL` | 千问文本模型，默认 `qwen-plus` |
| `TEXT_AI_PROVIDER` | 文本 AI 默认模型，建议 `deepseek` |
| `TIMEZONE_OFFSET_MINUTES` | 时区分钟偏移，中国大陆为 `480` |
| `TIMEZONE_SQL_OFFSET` | MySQL 查询用时区，中国大陆为 `+08:00` |
| `CORS_ORIGIN` | 允许访问后端的域名白名单，多个域名用英文逗号分隔 |
| `WX_APPID` | 微信小程序 AppID |
| `WX_SECRET` | 微信小程序 AppSecret |
| `WX_TEMPLATE_ID` | 微信订阅消息模板 ID |

---

## 2. 服务器准备

推荐环境：

- Ubuntu 22.04 LTS
- Node.js 18 或 20
- MySQL 8
- Nginx
- PM2
- HTTPS 证书，例如 Let's Encrypt 或云厂商证书

安装基础环境示例：

```bash
sudo apt update
sudo apt install -y nginx mysql-server git
```

安装 Node.js 后确认版本：

```bash
node -v
npm -v
```

安装 PM2：

```bash
sudo npm install -g pm2
```

---

## 3. 初始化 MySQL

登录 MySQL：

```bash
sudo mysql
```

创建数据库和用户：

```sql
CREATE DATABASE lessugar DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lessugar'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON lessugar.* TO 'lessugar'@'localhost';
FLUSH PRIVILEGES;
```

导入表结构：

```bash
cd server
mysql -u lessugar -p lessugar < sql/schema.sql
```

如果是已有数据库，新增字段时需要注意：

```sql
ALTER TABLE users ADD COLUMN ai_provider VARCHAR(32) DEFAULT 'deepseek';
```

检查时区：

```sql
SELECT @@global.time_zone, @@session.time_zone;
```

建议服务器和 MySQL 都使用 `+08:00` 或确保 `.env` 中的：

```env
TIMEZONE_OFFSET_MINUTES=480
TIMEZONE_SQL_OFFSET=+08:00
```

---

## 4. 部署后端服务

进入后端目录：

```bash
cd server
npm install
```

创建 `.env`：

```bash
cp .env.example .env
nano .env
```

启动测试：

```bash
npm start
```

浏览器访问：

```text
http://服务器IP:3000/
```

看到：

```text
LESSugar API running
```

表示后端启动成功。

使用 PM2 守护进程：

```bash
pm2 start src/app.js --name lessugar-api
pm2 save
pm2 startup
```

查看日志：

```bash
pm2 logs lessugar-api
```

---

## 5. 配置 Nginx 反向代理

示例域名：

```text
api.yourdomain.com
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置后检查：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. 配置 HTTPS

微信小程序正式环境必须 HTTPS。

如果使用 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

完成后测试：

```text
https://api.yourdomain.com/
```

应返回：

```text
LESSugar API running
```

---

## 7. 微信小程序后台配置

登录微信公众平台，在“小程序后台 → 开发管理 → 开发设置”中配置服务器域名。

需要添加：

```text
request 合法域名：https://api.yourdomain.com
uploadFile 合法域名：https://api.yourdomain.com
```

如果使用订阅消息，还需要：

1. 在微信公众平台申请订阅消息模板。
2. 将模板 ID 写入后端 `.env`：

```env
WX_TEMPLATE_ID=你的模板ID
```

---

## 8. 小程序前端发布前检查

### 8.1 修改 API 地址

文件：

```text
miniprogram/app.js
```

确认：

```js
apiBaseUrl: 'https://api.yourdomain.com/api'
```

### 8.2 检查模型选择

前端模型选择位于：

```text
pages/profile/profile
```

支持：

- DeepSeek
- ChatGPT
- 千问

如果用户不选择，默认使用：

```text
deepseek
```

### 8.3 检查图片识别

食物拍照识别固定使用千问 VL：

```env
QWEN_MODEL=qwen3-vl-flash
```

---

## 9. 接口自测清单

后端启动后，建议依次测试：

```text
GET  /
POST /api/auth/wechat-login
POST /api/profile/save
POST /api/recommend
POST /api/record/add
GET  /api/record/today
GET  /api/record/summary
POST /api/insight/daily
POST /api/prep
POST /api/reminder/enable
POST /api/recognize
```

重点检查：

- 登录是否能返回 openid
- 健康档案是否能保存
- AI 菜单是否能生成
- 饮食记录是否能写入 MySQL
- 首页今日热量是否只统计当天
- 图片识别是否能返回 foods
- 订阅提醒是否只提醒未打卡用户

---

## 10. 上线前最终检查清单

- [ ] `miniprogram/app.js` 已改为真实 HTTPS API 地址
- [ ] `.env` 已配置 MySQL 参数
- [ ] `.env` 已配置 DeepSeek API Key
- [ ] `.env` 已配置 OpenAI API Key，如果启用 ChatGPT
- [ ] `.env` 已配置 Qwen API Key
- [ ] `.env` 已配置微信 `WX_APPID` 和 `WX_SECRET`
- [ ] `.env` 已配置 `WX_TEMPLATE_ID`，如果启用提醒
- [ ] MySQL 已执行 `server/sql/schema.sql`
- [ ] Nginx 已代理到 Node 服务
- [ ] HTTPS 已生效
- [ ] 微信后台已配置 request/uploadFile 合法域名
- [ ] 小程序开发者工具中真机预览通过
- [ ] 生产环境不使用 `your-domain.com`、`your_key`、`your_password` 等占位值

---

## 11. 常见问题

### 11.1 小程序接口请求失败

检查：

- `apiBaseUrl` 是否是 HTTPS
- 微信后台是否配置合法域名
- Nginx 是否代理成功
- 后端 PM2 是否运行

### 11.2 AI 推荐失败

检查：

- DeepSeek / OpenAI / Qwen API Key 是否正确
- 用户选择的模型是否有对应 Key
- PM2 日志中是否有 `api key missing`

### 11.3 图片识别失败

检查：

- `QWEN_API_KEY` 是否正确
- `QWEN_MODEL` 是否配置
- 微信后台是否配置 uploadFile 合法域名
- 上传图片是否小于后端限制

### 11.4 今日热量不正确

检查：

- 是否调用 `/api/record/today`
- `TIMEZONE_OFFSET_MINUTES` 是否为 `480`
- `TIMEZONE_SQL_OFFSET` 是否为 `+08:00`
- MySQL 服务器时区是否正常
