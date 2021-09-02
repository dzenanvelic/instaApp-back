const express = require('express')
const User = require('../models/user')
const router = express.Router()
const bcrypt = require('bcrypt')
const crypto=require('crypto')
const jwt = require('jsonwebtoken')
const{JWT_SECRET}= require('../keys')
const verify = require('../middleware/verify')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:process.env.SENDGRID_KEY
    }
}))

//register route
router.post('/register',async(req,res)=>{
    try {
        const {username, email, password} = req.body
        if(!email || !username || !password){
            res.status(422).json({error:"Please add all fields"})
        }
        User.findOne({email})
        .then((savedUser)=>{
            if(savedUser){
              
                return res.status(422).json("user already exists with that email")
            }
        })
      const hashedPassword = await  bcrypt.hash(password,12)
      
    const newUser = await new User({username,
         email,
          password:hashedPassword})

          newUser.save()
          .then(newUser=>{
              transporter.sendMail({
                  to:newUser.email,
                  from:"no-reply@instaApp.com",
                  subject:"register success",
                  html:"<h1>Welcome to instaApp</h1>"
              })
             
              res.json("User successfuly saved")
          } )
    
    } catch (error) {
       console.log("USER CREATE ERROR",error) 
    }

})
//signin route
router.post('/login',(req,res)=>{
    try {
        const {email,password} = req.body
if(!email || !password){
   return res.status(422).json("Please fill up all fields")
}
User.findOne({email})
.then(savedUser=>{
    if(!savedUser){
       return res.status(422).json({error:"Invalid email or password"})
    }
    bcrypt.compare(password,savedUser.password)
    .then(doMatch=>{
        if(doMatch){
              const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
              const{_id, email, username,followers,following, profilePic}= savedUser
            res.json({token,user:{_id, email, username ,followers, following,profilePic}})
        }else{
             return res.status(422).json({error:"Invalid email or password"})
        }
    })
    .catch(err=>console.log("COMPARING PASSWORD ERROR",error))
})
.catch(err=>console.log("FIDING USER ERROR",err))
    } catch (error) {
        res.status(500).json("SIGNIN MAIN FAILURE",error)
    }
  

})
//reset password
router.post('/reset',(req,res)=>{
    try {
        crypto.randomBytes(32,(err,buffer)=>{
    if(err){
        console.log("Crypto error",err)
    }
    const token = buffer.toString('hex')
    User.findOne({email:req.body.email})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"User do not exists"})
        }
        user.resetToken = token
        user.expireToken = Date.now() + 3600000
        user.save()
        .then((result)=>{
            transporter.sendMail({
                to:user.email,
                from:"no-reply@instaApp.com",
                subject:"password reset",
                html:`<p>You requested for password reset</p>
                <h5>Click on this <a href="http://localhost:3000/resetpassword/${token}">link</a> to reset password</h5>`
            })
            res.json({message:"Check your email"})
        })
    })
})
    } catch (error) {
       console.log("CREATING NEW PASSWORD ERROR",error) 
    }

})
//new password
router.post('/newpassword',(req,res)=>{
   const newPassword= req.body.password; 
   const sentToken = req.body.token
   User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
   .then(user=>{
       if(!user){
return res.status(422).json({error:"Try again session expired"})
       }
       bcrypt.hash(newPasword,12)
       .then(hashedPassword=>{
           user.password=hashedPassword
           user.resetToken= undefined
           user.expireToken=undefined
           user.save()
.then((savedUser)=>{
    res.json({message:"Password updated successfuly"})
})
           
       })
   }).catch(err=>console.log("CHANGING PASSWORD USER ERROR",err))
})
module.exports = router