var express = require('express');
const app = express()
const {UserModel} = require('./Schema/user')
const mongoose = require('mongoose')
const {dbUrl} = require('./common/dbconfig')
const {hashPassword,hashCompare,createToken,validate} = require('./common/auth')
mongoose.connect(dbUrl).then( ()=> console.log('Connected!'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
//user model
app.get('/',validate,async function(req, res) {
  try {
    let users = await UserModel.find();
    res.status(200).send({
      users,
      message:"Users Data Fetch Successfull!"
    })
  } catch (error) {
    res.status(500).send({message:"Internal Server Error",error})
  }
});

app.post('/signup',async(req,res)=>{
    //console.log(req.body.email)
  try {
    let user = await UserModel.findOne({email:req.body.email})
    if(!user)
    {
      
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword
      let user = await UserModel.create(req.body)

      res.status(201).send({
        message:"User Signup Successfull!"
      })
    }
    else
    {
      res.status(400).send({message:"User Alread Exists!"})
    }

  } catch (error) {
    res.status(500).send({message:"Internal Server Error",error})
  }
})

app.post('/login',async(req,res)=>{
  try {
    let user = await UserModel.findOne({email:req.body.email})
    if(user)
    {
      //verify the password
      if(await hashCompare(req.body.password,user.password)){
        // create the token
        let token = await createToken({
          name:user.name,
          email:user.email,
        })
        res.status(200).send({
          message:"User Login Successfull!",
          token
        })
      }
      else
      {
        res.status(402).send({message:"Invalid Credentials"})
      }
    }
    else
    {
      res.status(400).send({message:"User Does Not Exists!"})
    }

  } catch (error) {
    res.status(500).send({message:"Internal Server Error",error})
  }
})

app.get('/:id', async(req, res)=> {
  try {
    let user = await UserModel.findOne({_id:req.params.id});
    res.status(200).send({
      user,
      message:"Users Data Fetch Successfull!"
    })
  } catch (error) {
    res.status(500).send({message:"Internal Server Error",error})
  }
});

app.put('/:id',async(req,res)=>{
  try {
    let user = await UserModel.findOne({_id:req.params.id})
    if(user)
    {
      user.name = req.body.name
      user.email = req.body.email
      await UserModel.save()

      res.status(200).send({
        message:"User Updated Successfully!"
      })
    }
    else
    {
      res.status(400).send({message:"User Does Not Exists!"})
    }

  } catch (error) {
    res.status(500).send({message:"Internal Server Error",error})
  }
})

app.delete('/:id',async(req,res)=>{
  try {
    let user = await UserModel.findOne({_id:req.params.id})
    if(user)
    {
      let user = await UserModel.deleteOne({_id:req.params.id})
      res.status(200).send({
        message:"User Deleted Successfull!"
      })
    }
    else
    {
      res.status(400).send({message:"User Does Not Exists!"})
    }

  } catch (error) {
    res.status(500).send({message:"Internal Server Error",error})
  }
})


app.listen(3000,() => {
    console.log("server is running..."+3000);
})
