import { BALANCES, openOrders, PRICES } from "../../shared/objects.ts";
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
  try {
    console.log(tradeObj);
   const userId = tradeObj.userId;
  const currentPriceOfAsset = PRICES[tradeObj.asset];
  console.log(currentPriceOfAsset);
  const obj = { ...tradeObj, openingPrice:currentPriceOfAsset};
  if(BALANCES[userId].usd<Number(tradeObj.margin)){
  await tradeListener.xAdd("callback","*",{
    tradeId:tradeObj.tradeId,
    status:"REJECTED",
    userId: tradeObj.userId.toString(),
    asset: tradeObj.asset,
    })
   return;
  }
  BALANCES[userId].usd -= Number(tradeObj.margin);
  BALANCES[userId].locked += Number(tradeObj.margin);
  openOrders.push(obj);
  console.log('Trade created');
  await tradeListener.xAdd("callback","*",{
    tradeId:tradeObj.tradeId,
    status:"ACCEPTED",
    userId: tradeObj.userId.toString(),
    asset: tradeObj.asset,
  })
    console.log("pushed to the quueue");
  } catch (error) {
    console.log("Error in creating the trade");
    await tradeListener.xAdd("callback","*",{
    tradeId:tradeObj.tradeId,
    status:"FAILED",
    userId: tradeObj.userId.toString(),
    asset: tradeObj.asset,
  }) 
  }
  }

