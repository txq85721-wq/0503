const express = require('express')
const cors = require('cors')
require('dotenv').config()

const recommendRoute = require('./routes/recommend')
const authRoute = require('./routes/auth')
const reminderRoute = require('./routes/reminder')
const insightRoute = require('./routes/insight')
const prepRoute = require('./routes/prep')
const recognizeRoute = require('./routes/recognize')
const { startReminderJob } = require('./services/reminderService')

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('LESSugar API running')
})

app.use('/api/recommend', recommendRoute)
app.use('/api/auth', authRoute)
app.use('/api/reminder', reminderRoute)
app.use('/api/insight', insightRoute)
app.use('/api/prep', prepRoute)
app.use('/api/recognize', recognizeRoute)

startReminderJob()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
