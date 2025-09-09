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
        if(tradeObj.order == "OPEN"){
          await createTrade(tradeObj);
        }
        else if(tradeObj.order == "CLOSE"){
          await closeTrade(tradeObj);
        }
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
  
async function closeTrade(tradeObj) {
  try {
    const { closeId, orderId, userId } = tradeObj;
    const orderIndex = openOrders.findIndex(o => o.tradeId === orderId);
    if (orderIndex === -1) {
      await tradeListener.xAdd("callback", "*", {
        tradeId:closeId,
        status: "NOT_FOUND",
        orderId,
        userId,
      });
      return;
    }
    const order = openOrders[orderIndex];
    const currentPrice = PRICES[order.asset].price;
console.log("Calculating PnL with:", {
  currentPrice,
  openingPrice: order.openingPrice.price,
  margin: order.margin,
  leverage: order.leverage
})
    const margin = Number(order.margin);
    console.log("margin",margin);
    const leverage = Number(order.leverage);
    console.log("leverage",leverage);
    const pnl = (currentPrice - order.openingPrice.price) * (margin) * (leverage);
    console.log(pnl);// this is profit loss calculation

    BALANCES[userId].locked -= Number(order.margin);
    BALANCES[userId].usd += Number(order.margin) + pnl;
    openOrders.splice(orderIndex, 1);
    await tradeListener.xAdd("callback", "*", {
      tradeId:closeId,
      status: "CLOSED",
      orderId,
      userId,
      pnl: pnl.toString(),
    });
    console.log(`Trade ${orderId} closed with PnL: ${pnl}`);
  } catch (error) {
    console.log("Error in closing the trade", error);
  }
}
