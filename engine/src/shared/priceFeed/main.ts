import { subscriber } from '../../index.ts';
import { PRICES } from '../objects.ts';
export async function subscribeToPriceFeeds(){
  subscriber.subscribe("price_feed",(data)=>{
    const parsedData = JSON.parse(data);
    parsedData.price_updates.forEach(({ asset, price, decimal }: { asset: string; price: number; decimal: number }) => {
      PRICES[asset] = { price, decimal };
    });
  })
}

