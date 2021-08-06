const express = require('express')
require('dotenv').config()
const { DbConnection } = require('./database/dbConnection')
const { userRoute } = require('./routes/userRoute/userRoute')
const app = express()
DbConnection()
app.get('/', (req, res) => {
    res.json({ status: true, message: "welcome to entry point of social media backend" })
})

app.use('/user', userRoute)
app.listen(9000, () => console.log("server is up and running"))

