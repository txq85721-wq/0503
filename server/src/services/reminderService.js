const cron = require('node-cron')
const pool = require('../db')
const { sendSubscribeMessage } = require('./wechatService')

async function saveUserSetting(openid, setting) {
  await pool.query(
    'INSERT INTO users (openid, reminder_enabled) VALUES (?, ?) ON DUPLICATE KEY UPDATE reminder_enabled = ?',
    [openid, setting.reminderEnabled ? 1 : 0, setting.reminderEnabled ? 1 : 0]
  )
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function startReminderJob() {
  cron.schedule('0 20 * * *', async () => {
    try {
      const [users] = await pool.query('SELECT openid FROM users WHERE reminder_enabled = 1')

      for (const user of users) {
        const [[checkin]] = await pool.query('SELECT last_date FROM checkins WHERE openid=?', [user.openid])

        if (checkin && String(checkin.last_date).slice(0, 10) === todayString()) {
          continue
        }

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
    } catch (e) {
      console.log('cron error skip', e.message)
    }
  })
}

module.exports = { saveUserSetting, startReminderJob }
