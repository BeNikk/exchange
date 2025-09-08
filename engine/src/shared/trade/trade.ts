import { BALANCES, openOrders } from "../../shared/objects.ts";
import { tradeListener } from "../../index.ts";
export async function trade(tradeId:string){
  try {
    let lastId = "$";
    while(true){
      const response = await tradeListener.xRead({
        key:'trade-stream',id:lastId
      },
        {
          BLOCK:0, COUNT:1
        })
      if(!response) continue;

       for( const msg of response[0].messages){
        const tradeObj = msg.message;
        createTrade(tradeObj);
        lastId = msg.id
      }
    }

  } catch (error) {
    console.log(error);
    return;
  }
}

async function createTrade(tradeObj){
  console.log(tradeObj);
}

