import express from 'express';
import authRouter from './routes/auth.ts';
import tradeRouter from './routes/trade.ts';
import cors from 'cors';
import { initRedis } from './shared/redis.ts';
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1",authRouter);
app.use("/api/v1",tradeRouter);
async function start(){
  await initRedis();
  app.listen(3000,()=>{
  console.log("Server running on PORT 3000");
});
}
start();
