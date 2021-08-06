const mongoose = require('mongoose')
const {Schema , model} = mongoose  
const UserSchema = Schema({
  username : {
    type : String , 
    required : true , 
    unique : true
  } ,
  email : {
    type : String , 
    required : true , 
    unique : true
  } ,
  password :{
    type : String ,
    required : true
  } , 

})

const Users = model('User' , UserSchema)

module.exports = {Users}