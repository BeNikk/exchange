import express, {type Request, type Response} from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/config.ts';
import { sendEmail } from '../utils/email.ts';
import { Users } from '../shared/users.ts';
const authRouter = express.Router();

authRouter.post("/signup",async(req:Request,res:Response)=>{
  try {
   const { email }   req.body; //IRL email should come by the user, but resend only allows sending email to the user who created the api key
     const token = jwt.sign({email},JWT_SECRET);
     const response = await sendEmail(token);
     if (response == true){
      res.status(200).json({message:"Check your email"});
      return;
      //Users.push({email}); 
      //if we had different users
    }
    else{
    res.status(500).json({message:"Internal server error"});
      return;
    } 
    } catch (error) {
    console.log("ERROR IN SIGNUP",error);
    }
  });

authRouter.post('/signin',async(req:Request,res:Response)=>{
  try {
  const { email } = req.body;
  const user = Users.find((u:any)=>{
    return u.email == email;
  })
  if(!user){
    res.json({message:"User not found, Signup to create the account"});
    return;
  }
  const token = jwt.sign({email},JWT_SECRET);
  const response = await sendEmail(token);
  if(response == true){
    res.status(200).json({message:"Check your email"});
    return;
  }
  else{
    res.status(500).json({message:"Internal server error"});
    return;
  } 
  } catch (error) {
   console.log("ERROR IN SIGN IN ROUTE");
    res.status(500).json({message:"Internal server error"});
  } 
})

authRouter.get("/signin/post",(req:Request,res:Response)=>{
  try {
   const token = req.query.token;
    if(!token){
      res.status(400).json({message:"No token found"});
      return;
    }
    const verify = jwt.verify(token,JWT_SECRET);
    if(verify){
      res.cookie("authToken",token).redirect("https://frontend.com");
      return;
    }
    else{
      res.status(403).json({message:"Token not verified"});
      return;
    }
  } catch (error) {
   console.log("ERROR IN GET SIGNIN POST",error);
    res.status(500).redirect("https://signup.com");
  }
})
export default authRouter;
