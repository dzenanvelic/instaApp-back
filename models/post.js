const mongoose = require('mongoose')
const {ObjectId}= mongoose.Schema
const postSchema = new mongoose.Schema({
title:{
    type:String,
    required:true
},
body:{
   type:String,
   required:true 
},
photo:{
    type:String,
     required:true 
},
postedBy:{
    type:ObjectId,
    ref:"User"
},likes:{
    type:Array,
    default:[],
},
comments:[{
   
        text:String,
         postedBy:{
        type:ObjectId,
   ref:"User"}
    
    }],
    postedBy:{
        type:ObjectId,
   ref:"User"
    }
}
,{timestamps:true})



module.exports = mongoose.model("Post", postSchema)