const express= require('express')
const mongoose = require('mongoose')
const app = express()
const dotenv = require('dotenv')
const morgan = require("morgan")

const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')
const userRouter = require('./routes/user')

dotenv.config()

//database connection MONGODB
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(res=>console.log("Database for insta app connected")

).catch(err=>console.log("Database error",err))


//midlleware
app.use(express.json())
app.use(morgan('tiny'))


//routes
app.use('/auth',authRouter)
app.use('/post',postRouter)
app.use('/user',userRouter)


//server running
const PORT = process.env.PORT || 5000 
app.listen(PORT,()=>{
    console.log(`Server runs on port ${PORT}`)
})