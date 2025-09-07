import { createClient } from "redis";


const client = createClient();
async function main(){
await client.connect();
const priceMap = new Map();
const ws = new WebSocket("wss://ws.backpack.exchange/");

ws.onopen=()=>{
  console.log("Connection established");
  ws.send(JSON.stringify({
  "method": "SUBSCRIBE",
  "params": ["ticker.SOL_USDC", "ticker.BTC_USDC", "ticker.ETH_USDC"],
  "id":1
}));
}

ws.onmessage=(data)=>{
  const parsedData = JSON.parse(data.data);
  const symbol = parsedData.data.s;
  const asset = symbol.split("_")[0];
  const price = Number(parsedData.data.c);
  const decimals = asset === "SOL" ? 6 : 4;
  priceMap.set(asset, { price, decimal: decimals });
}

ws.onclose=()=>{
  console.log("Connection closed");
 
}

setInterval(()=>{
    const payload = {
      price_updates: Array.from(priceMap.entries()).map(([asset, { price, decimal }]) => ({
      asset,
      price,
      decimal,
    })),
    };
  client.publish("price_feed", JSON.stringify(payload));
   console.log("Published:", payload);

},100)
}
main();
