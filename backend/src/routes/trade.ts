import express, { type Request, type Response } from 'express';
import { randomUUIDv7 } from "bun";
import { RedisSubscriber } from '../shared/redisSubscriber.ts';
import { createClient } from "redis";
import { subscriber } from '../index.ts';
export const writeClient = createClient(); // separate client for writing
const tradeRouter = express.Router();
tradeRouter.post("/trade/create",async(req:Request,res:Response)=>{
    try {
     const { asset, type, margin, leverage, slippage } = req.body;
    console.log("trade/create");
     const userId = 1; // should come from cookies/middlewares 
     const startTime = Date.now();
     const tradeId = randomUUIDv7();
     const id = await writeClient.xAdd("trade-stream","*",{
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
export default tradeRouter;
