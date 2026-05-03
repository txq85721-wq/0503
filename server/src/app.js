const express = require('express')
const cors = require('cors')
require('dotenv').config()

const recommendRoute = require('./routes/recommend')
const authRoute = require('./routes/auth')
const reminderRoute = require('./routes/reminder')
const { startReminderJob } = require('./services/reminderService')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('LESSugar API running')
})

app.use('/api/recommend', recommendRoute)
app.use('/api/auth', authRoute)
app.use('/api/reminder', reminderRoute)

startReminderJob()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
