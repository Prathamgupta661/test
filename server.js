const express=require('express')
const fs=require('fs')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
// const users=require('./Mock_data.json')
const port=3000

let todos=[]

app.set('view engine','ejs')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

app.get('/index',(req,res)=>{
    res.sendFile(path.join(__dirname+'/index.html'))
});

app.post('/submit-form',(req,res)=>{

    console.log(req.body)
    res.send('Form submitted')
})

var ctrl=1
app.post('/todo',(req,res)=>{
    const newtodo={
        id:ctrl,
        title:req.body.title,
        description:req.body.description
    }
    ctrl=ctrl+1
    todos.push(newtodo)
    console.log("Todo Added......")
    res.status(201)
    res.redirect('/')
})

app.get('/todo',(req,res)=>{
    console.log('Displaying Todo.......')
    return res.json(todos)
})

app.get('/',(req,res)=>{
    res.render('index',{todo:todos})
})

// Connecting Database from here

mongoose.connect('mongodb://localhost:27017/practice-data').then(()=>console.log("Mongodb is connected")).catch(err=>console.log('mongo error',err))
const userSchema=new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    job_title:{
        type:String,

    }
})

const user=mongoose.model("user_data",userSchema)






//Rest API FROM HERE

app.get('/api/users',async(req,res)=>{
    const dbuser=await user.find({})
    return res.json(dbuser)
})

app.get('/users',async(req,res)=>{
    const dbuser=await user.find({})
    const html=`
        <ul>
            ${dbuser.map((user)=>`<li> Name:- ${user.first_name}</li> <li> Email:- ${user.email}</li> <li> Job Title:- ${user.job_title}</li><br>`).join("")}
    `
    res.send(html)
})

app.route("/api/users/:id").get(async (req,res)=>{
    const finduser=await user.findById(req.params.id)
    if(!user){
        return res.status(404).send({message:'User not found'})
        }
    return res.json(finduser)
}).patch(async(req,res)=>{
    const dbusser=await user.findByIdAndUpdate(req.params.id,req.body);
    return res.json(dbusser)
    
}).delete(async(req,res)=>{
    const resu=await user.findByIdAndDelete(req.params.id)
    return res.json({message:'User deleted',resu})
})

app.post("/api/users",async(req,res)=>{
    const body=req.body
    if(!body || !body.first_name || !body.last_name || !body.gender || !body.job_title || !body.email){
        return res.status(400).send({message:'Please fill all the fields'})
    }
    const dbuser=await user.create({
        first_name:body.first_name,
        last_name:body.last_name,
        email:body.email,
        gender:body.gender,
        job_title:body.job_title
    })
    return res.json({message:'User created',dbuser})
})


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
});