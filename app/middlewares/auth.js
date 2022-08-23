require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const  withAuth = (req,res,next)=>{
    const token = req.headers["x-acess-token"];
    if(!token){
        res.status(401).json({error:"unauthorized user"})
    }else{
        jwt.verify(token,secret,(err, decode)=>{
            if(err){
                res.status(401).json({error:"unauthorized user REF=2"})
            }else{
                req.email = decode.email;
                User.findOne({email: decode.email}) .then(user=>{
                    req.user=user;
                    next()
                })
                .catch(err=>{
                    res.status(401).json({error:err})
                })
            }
        })
    }
}

module.exports = withAuth