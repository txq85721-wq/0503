const cron = require('node-cron')
const pool = require('../db')
const { sendSubscribeMessage } = require('./wechatService')

async function saveUserSetting(openid, setting) {
  try {
    await pool.query(
      'INSERT INTO users (openid, reminder_enabled) VALUES (?, ?) ON DUPLICATE KEY UPDATE reminder_enabled = ?',
      [openid, setting.reminderEnabled ? 1 : 0, setting.reminderEnabled ? 1 : 0]
    )
  } catch (e) {
    console.log('save reminder fail', e.message)
  }
}

function startReminderJob() {
  cron.schedule('0 20 * * *', async () => {
    console.log('执行提醒任务...')

    try {
      const [users] = await pool.query('SELECT openid FROM users WHERE reminder_enabled = 1')

      for (const user of users) {
        try {
          await sendSubscribeMessage({
            openid: user.openid,
            templateId: process.env.WX_TEMPLATE_ID,
            data: {
              thing1: { value: '饮食打卡提醒' },
              time2: { value: '今晚 20:00' },
              thing3: { value: '记得记录你的饮食哦' }
            }
          })
        } catch (e) {
          console.log('push fail', user.openid)
        }
      }
    } catch (e) {
      console.log('cron error skip', e.message)
    }
  })
}

module.exports = { saveUserSetting, startReminderJob }
