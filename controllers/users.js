
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Users } = require('../models/user-model')
const SignUp= async (req , res) =>{
  try{
    const secret = process.env.SECRET
    const { userDetails } = req.body
    const newUser = new Users(userDetails)
    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(newUser.password , salt)
    const SavedUser = await newUser.save()
    const token = jwt.sign({userId : SavedUser._id}, secret, {expiresIn : '24h'})
    res.json({status : true  , message : 'user added successfully' , token})
  }
  catch(error){
    if(error.code === 11000){
       res.json({status : false , code : 11000,  message : "couldn't add user" , errorDetail : error.message , existingField : Object.keys(error.keyPattern)[0]
       })
    }
    res.json({status : false , message : "couldn't add user" , errorDetail : error.message})
  }
 
}

const SignIn = async (req , res) =>{
  try{
    const secret = process.env.SECRET
    const  userDetails  = req.body
    const ourUser = await Users.findOne({username : userDetails.username})
    if(ourUser){
      const validPassword = await bcrypt.compare(userDetails.password, ourUser.password);
      if(validPassword){
        const token = jwt.sign({userId: ourUser._id}, secret, {expiresIn : '24h'})
        res.json({status : true  , allowUser : true , message : "logged in successfully" , token
      })
      }
    else{
        res.json({status : true  , allowUser : false , message : "username and/or password incorrect"})
      }
    }
    else{
      res.json({status : true  , allowUser : false , message : "username and/or password incorrect"})
    }

  }
  catch(error){
    res.json({status : false , errorDetail : error , errorMesssage : error.message})
  }

}

module.exports = {SignUp, SignIn}