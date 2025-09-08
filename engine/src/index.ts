import { createClient } from "redis";
import { subscribeToPriceFeeds } from "./shared/priceFeed/main.ts";
import { trade } from './shared/trade/trade.ts';
export const subscriber = createClient();
export const tradeListener = createClient(); // separate client as subscriber listens to subscribe methods and cannot xread etc

async function connectClients(){
  
  await subscriber.connect();
  await tradeListener.connect();
  console.log("Clients connected");
}

async function main(){
  await connectClients();
  subscribeToPriceFeeds();
  trade();
}
main();
