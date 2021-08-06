const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.json({ status: true, message: "welcome to entry point of social media backend" })
})


app.listen(9000, () => console.log("server is up and running"))

