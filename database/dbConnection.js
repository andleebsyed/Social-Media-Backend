const mongoose = require('mongoose')
function DbConnection() {

  mongoose.connect(process.env.URI , {useNewUrlParser : true , useUnifiedTopology : true, useCreateIndex: true})
.then(res => console.log("connected to database"))
.catch(error => console.log("error occured " , error))
}
module.exports = {DbConnection}