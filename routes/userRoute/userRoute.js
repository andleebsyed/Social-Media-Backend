const express = require('express')
const { SignIn, SignUp } = require('../../controllers/users')
const userRoute = express.Router()

userRoute.post('/signin', SignIn)
userRoute.post('/signup', SignUp)

module.exports = {userRoute}