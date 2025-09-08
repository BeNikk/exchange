import express, { type Request, type Response } from 'express';
import { client } from '../shared/redis.ts';
import { randomUUIDv7 } from "bun";

const tradeRouter = express.Router();


tradeRouter.post("/trade/create",async(req:Request,res:Response)=>{
    try {
     const { asset, type, margin, leverage, slippage } = req.body;
     const userId = 1; // should come from cookies/middlewares 
     const startTime = Date.now();
     const tradeId = randomUUIDv7();
     const id = await client.xAdd("trade-stream","*",{
      tradeId:tradeId,
      userId:userId.toString(),
      asset:asset,
      type:type,
      margin:margin.toString(),
      leverage:leverage.toString(),
      slippage:slippage.toString(),
    });
    console.log("pushed to queue");
    res.status(200).json({message:"Pushed to queue"});
  
    
      
    } catch (error) {
       console.log("ERROR IN TRADE/CREATE",error);
       res.status(500).json({message:"Internal server error"});
      
    }
})

export default tradeRouter;
