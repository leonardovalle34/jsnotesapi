var express = require('express');
var router = express.Router();
const User = require('../models/user');
const jwt  = require("jsonwebtoken");
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const withAuth = require("../middlewares/auth")

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error registering new user'});
  }
})

router.post("/login", async(req,res)=>{
  const {email, password} = req.body;

  try{
    let user = await User.findOne({email});
    if(!user){
      res.status(401).json({error:"Incorrect email or password REF=1"})//trata erros do password
    }else{
      user.isCorrectPassword(password,function(err,same){//var user refetente ao usuario, metodo iscorrect declarado no user.js - metodo que verifica se é o password correto
        if(!same){//variavel same que é que guarda se o password é o mesmo ou nao
          res.status(401).json({error:"Incorrect email or password REF=2" })
        }else{//caso esteja tudo certo entra aqui
          const token = jwt.sign({email}, secret, {expiresIn: "10d"});
          res.json({user: user, token: token})
        }
      })
    }
  }catch(err){
      res.status(500).json({error:"Internal Error, please try again"})
  }
})
router.put("/",withAuth,  async(req,res)=>{
  const {name,  email}=req.body
  try{
      let user = await User.findOneAndUpdate(
          {_id: req.user._id},
          {$set:{name: name, email: email}},
          {upsert: true, "new" : true}
          )
      res.json(user)
  }catch(error){
      res.json({error: error}).status(401)
  }
});

router.put("/password",withAuth,  async(req,res)=>{
  const { password }=req.body
  try{
      let user = await User.findOne({_id: req.user._id});
      user.password = password;
      user.save();
      res.json(user)
  }catch(error){
      res.json({error: error}).status(401)
  }
});

router.delete("/",withAuth,  async(req,res)=>{
  try{
      let user = await User.findOne({_id: req.user._id});
      await user.delete();
      res.json({message: "User deleted"}).status(201)
  }catch(error){
      res.json({error: error}).status(500)
  }
});

module.exports = router;