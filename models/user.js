const mongoose = require('mongoose')
const {ObjectId}= mongoose.Schema
const userSchema = new mongoose.Schema({
username:{
    type:String,
    required:true,
    unique:true
},
email:{
    type:String,
required:true,
 unique:true},
password:{
    type:String,
    required:true
},isAdmin:{
    type:Boolean,
    default:false

},
followers:[
    {type:ObjectId,ref:"User"},
],
following:[
    {type:ObjectId,ref:"User"},
],
profilePic:{
    type:String,
    default:null

},
resetToken:String,
expireToken:Date,


},{timestamps:true})

module.exports = mongoose.model("User",userSchema)