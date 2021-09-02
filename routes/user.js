const express = require('express')
const User = require('../models/user')
const Post = require('../models/post')
const verify = require('../middleware/verify')
const router = express.Router()


//get user and user posts
router.get('/:id',verify,async(req,res)=>{

    try {
    const user =await User.findById({_id:req.params.id})
    //console.log("USER",user)
        const userPosts = await Post.find({postedBy:user._id})
       // console.log("POSTS",userPosts)
        res.status(200).json({user,userPosts})
    } catch (error) {
        console.log("ERROR FINDING USER POSTS",error)
        res.status(500).json(error)
    }


})

//follow a user
router.put('/:id/follow',verify,async(req,res)=>{
    if(req.user._id !== req.params.id){
         try {
const user = await User.findById(req.params.id)
const currentUser = await User.findById(req.user._id)
      if(!user.followers.includes(req.user._id)){
          await user.updateOne({$push:{followers:req.user._id}}).populate("User", ('_id'))
          await currentUser.updateOne({$push:{following:req.params.id}}).populate("User", ('_id'))
          res.status(200).json("user has been followed")
      }else{
          res.status(403).json("You already follow this user")
      }

     } catch (error) {
         console.log("ERROR DURING FOLLOWING",error)
         res.status(422).json({error:error})
     }
    }else{
        res.status(403).json("you cant follow yourself")
    }
   
})

//unfollow user
router.put('/:id/unfollow',verify,async(req,res)=>{
    if(req.user._id !== req.params.id){
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.user._id)
            if(user.followers.includes(req.user._id)){
                await user.updateOne({$pull:{followers:req.user._id}})
                await currentUser.updateOne({$pull:{following:req.params.id}})
                res.status(200).json("User has been unfolowed")
            }else{
                res.status(403).json("You already not folow this user")
            }
        } catch (error) {
             res.status(500).json(error);
        }
        
    }else{
        res.status(403).json("You cannot follow yourself")
    }
})

//update user photo

router.put('/updatephoto/:id',verify,async(req,res)=>{
    if(req.user._id.toString() === req.params.id.toString()){
        try {
            const{profilePic}= req.body
            console.log("profilepic",profilePic)
           
             const user = await User.findByIdAndUpdate(req.user._id,{profilePic:profilePic},{new:true})
             res.status(200).json(user)
        } catch (error) {
           res.status(500).json(error)
           console.log("UPDATING USER ERROR",error)
        }

    }else{
        res.status(403).json("You are not allowed to change status")
    }
})
//search users
router.post('/searchusers',verify,(req,res)=>{
let userPattern = new RegExp("^" + req.body.query)
User.find({email:{$regex:userPattern}})
.select("_id email username")
.then(user=>{
    res.json({user})
}).catch(err=>console.log(err))
})

//get all users

    router.get('/',verify,async(req,res)=>{
        try {
            let users= await User.find({}).exec()
         res.json(users) 
        } catch (error) {
            console.log(error)
        }
    })    
        
       

    
      
  

module.exports = router