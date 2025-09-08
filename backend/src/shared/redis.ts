import { createClient } from 'redis';

export const client = createClient();
export async function initRedis(){
  await client.connect();
  console.log("Redis client connected");
}
