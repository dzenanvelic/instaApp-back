const express = require('express')
const User = require('../models/user')
const Post = require('../models/post')
const verify = require('../middleware/verify')
const router = express.Router()


//create post
router.post('/createpost',verify,async(req,res)=>{
    try {
         const {title,body,photo}= req.body
    if(!title || !body || !photo){
       return res.status(422).json({error:"Please fill up all text fields"})
    }
    req.user.password = undefined
    const post = await new Post({
        title,
    body,
    photo,
    postedBy:req.user
}).save()

    res.json(post)

    } catch (error) {
        res.status(500).json("POST CREATE ERROR",error)
    }
   
})
//fetch  all posts
router.get('/allposts',verify,async(req,res)=>{
    try {
         const posts = await Post.find({}).populate("postedBy",("username _id")).populate("comments.postedBy",('username _id')).sort({createdAt:-1})
         res.json(posts)
    } catch (error) {
        res.status(500).json("POST FETCHING ERROR",error)
    }
   
})
//post created by same user
router.get('/userposts',verify,async(req,res)=>{
    
    try {
      
         const postCreatedBySameUser = await Post.find({postedBy:req.user._id})
         .populate("postedBy",("_id username email" ))
         res.json(postCreatedBySameUser )
    } catch (error) {
        console.log("READING USRER POST",error)
    }
   
})
//like or unlike post
router.put('/like/:id',verify,async(req,res)=>{
    
    
  //  console.log("REQ BODY",req.body.user._id)
    try {
        const post = await Post.findById(req.params.id)

        if(!post.likes.includes(req.body.user._id)){
            await post.updateOne({$push:{likes:req.body.user._id}})
            res.json("You liked post")
        }else{
await post.updateOne({$pull:{likes:req.body.user._id}})
res.json("You unliked post")
        }
    } catch (error) {
        res.status(500).json(error)
        console.log("MOVIE LIKES ERROR",error)
    }
})

//comment post
/* router.put('/commentpost/:id',verify,async(req,res)=>{
    //console.log("BODY COMMENT REQ",req.body.text,req.user._id)
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
     Post.findByIdAndUpdate(req.params.id,{
    $push:{comments:comment}
    },{
        new:true
    }).populate("comments.postedBy",("_id username"))
    .populate("postedBy",("_id username"))
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
   
}) */

router.put('/commentpost/:id',verify,async(req,res)=>{

   // console.log("REQ BODY",req.body)
    try {
       /*  const message={
            text:req.body.text,
            postedBy:req.body.user._id
        } */
      const post =  await Post.findByIdAndUpdate(req.params.id,{$push:{comments:req.body}},{new:true})
        .populate("comments.postedBy",("username _id")).exec()

res.json(post)
        
    } catch (error) {
        res.status(422).json("ERROR UPDATE POST",error)
        console.log(req.body)

    }
})
//remove comment from post
router.delete('/removeComment/:id/:commentid',verify,async(req,res)=>{

try {
    
 const post = await Post.findByIdAndUpdate(req.params.id)
//console.log("POST",post)
//pull comment out
const comment = post.comments.find(comment=>comment.id === req.params.commentid);
//console.log("COMMENT",comment)
//check if comment exists
if(!comment){
    return res.status(404).json({msg:"Comment does not exists"})
}
//check user
if(comment.postedBy.toString() !== req.user.id ){
    return res.status(401).json({msg:"User not authorized"})
}
//console.log("REQ USER ID",req.user)
//get remove index
const removeIndex = post.comments.map(comment=>comment.postedBy.toString()).indexOf(req.user.id)

post.comments.splice(removeIndex,1);
await post.save()
res.json(post.comments)

} catch (error) {
    console.log(error)
    res.status(500).send("Error in removing comments")
}
   
})
//delete post
router.delete('/removepost/:id/:userId',verify,async(req,res)=>{
//console.log('USER',req.user._id)
//console.log("PARAMS ID",req.params.userId)
try {
    if(req.params.userId.toString() !== req.user._id.toString() || req.user.isAdmin !== true ){
        return res.status(401).json("User not authorized")
    }
await Post.findByIdAndDelete(req.params.id)
res.json("Post successfuly deleted")
} catch (error) {
    console.log("post delete error",error)
    res.status(500).json("ERROR IN POST DELETION")
}

})
  //  posts from people we following
  router.get('/folpost',verify,async(req,res)=>{
   // console.log("req user following",req.user)
    
    try {
         const posts = await Post.find({postedBy:{$in:req.user.following}}).populate("postedBy",("username _id")).populate("comments.postedBy",('username _id')).sort({createdAt:-1})
         res.json(posts)
         console.log("POSTS FOLLOWING",posts)
    } catch (error) {
        res.status(500).json("POST FETCHING ERROR",error)
    }
   

})

router.get('/getexactpost/:id',verify,async(req,res)=>{
    try {
        const exactPost =await  Post.findById(req.params.id)
        .populate("postedBy",'username _id')
        .populate("comments.postedBy",'username _id')
        res.json(exactPost)
    } catch (error) {
        res.status(500).json("EXACT POST ERROR",error)
    }

})
module.exports = router