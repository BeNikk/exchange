import express from 'express';
import authRouter from './routes/auth.ts';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1",authRouter);
app.listen(3000,()=>{
  console.log("Server running on PORT 3000");
});

