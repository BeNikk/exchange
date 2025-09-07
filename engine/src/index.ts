import { createClient } from "redis";

const subscriber = createClient();

const PRICES: Record<string, { price: number; decimal: number }> = {};

async function main(){
  await subscriber.connect();
  console.log("connected");
  subscriber.subscribe("price_feed",(data)=>{
    const parsedData = JSON.parse(data);
    console.log(parsedData);
    parsedData.price_updates.forEach(({ asset, price, decimal }: { asset: string; price: number; decimal: number }) => {
      PRICES[asset] = { price, decimal };
    });
    console.log(PRICES);
  })
}
main();
