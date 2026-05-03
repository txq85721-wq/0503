function formatDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function updateCheckin() {
  const today = formatDate()
  const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000))

  const data = wx.getStorageSync('checkin') || {
    lastDate: '',
    streak: 0,
    history: {}
  }

  if (data.history[today]) {
    return data
  }

  data.streak = data.lastDate === yesterday ? data.streak + 1 : 1
  data.lastDate = today
  data.history[today] = true

  wx.setStorageSync('checkin', data)
  return data
}

function getCheckin() {
  const today = formatDate()
  const data = wx.getStorageSync('checkin') || {
    lastDate: '',
    streak: 0,
    history: {}
  }

  return {
    ...data,
    checkedToday: Boolean(data.history[today])
  }
}

module.exports = { updateCheckin, getCheckin, formatDate }
