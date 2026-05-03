const cron = require('node-cron')
const { sendSubscribeMessage } = require('./wechatService')

// 简单内存用户表（后面可换数据库）
const users = []

function saveUserSetting(openid, setting) {
  const index = users.findIndex(u => u.openid === openid)
  if (index > -1) {
    users[index] = { ...users[index], ...setting }
  } else {
    users.push({ openid, ...setting })
  }
}

function startReminderJob() {
  cron.schedule('0 20 * * *', async () => {
    console.log('执行提醒任务...')

    for (const user of users) {
      if (!user.reminderEnabled) continue

      await sendSubscribeMessage({
        openid: user.openid,
        templateId: process.env.WX_TEMPLATE_ID,
        data: {
          thing1: { value: '饮食打卡提醒' },
          time2: { value: '今晚 20:00' },
          thing3: { value: '记得记录你的饮食哦' }
        }
      })
    }
  })
}

module.exports = { saveUserSetting, startReminderJob }
