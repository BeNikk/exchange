import express, { type Request, type Response } from 'express';
import { randomUUIDv7 } from "bun";
import { RedisSubscriber } from '../shared/redisSubscriber.ts';
import { createClient } from "redis";
import { subscriber } from '../index.ts';
export const writeClient = createClient(); // separate client for writing
const tradeRouter = express.Router();
tradeRouter.post("/create",async(req:Request,res:Response)=>{
    try {
     const { asset, type, margin, leverage, slippage } = req.body;
     const userId = 1; // should come from cookies/middlewares 
     const startTime = Date.now();
     const tradeId = randomUUIDv7();
     const id = await writeClient.xAdd("trade-stream","*",{
      order:"OPEN",
      tradeId:tradeId,
      userId:userId.toString(),
      asset:asset,
      type:type,
      margin:margin.toString(),
      leverage:leverage.toString(),
      slippage:slippage.toString(),
    });
    console.log("queue id",id);
    console.log("pushed to queue");
    const response = await subscriber.waitForTrade(tradeId);
    console.log(response);
    res.json({ tradeId, response });
    } catch (error) {
       console.log("ERROR IN TRADE/CREATE",error);
       res.status(500).json({message:"Internal server error"});
  }
})

tradeRouter.post("/close",async(req:Request,res:Response)=>{
  try {
    const { orderId } = req.body;
    const closeId = randomUUIDv7();
    if(!orderId){
      res.status(403).json({message:"Order Id required"});
      return;
    }
    const userId = 1;
    const id = await writeClient.xAdd("trade-stream","*",{
      order:"CLOSE",
      orderId:orderId,
      closeId:closeId,
      userId:userId.toString(),
    });
    console.log("pushed to queueu, id",id);
    const response = await subscriber.waitForTrade(closeId);
    return res.json(response);
    
  } catch (error) {
    console.log("ERROR IN CLOSE ROUTE",error);
    res.status(500).json({message:"INTERNAL SERVER ERROR"}); 
  }
})
export default tradeRouter;
