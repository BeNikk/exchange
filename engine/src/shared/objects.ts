export const PRICES: Record<string, { price: number; decimal: number }> = {};
export const BALANCES: Record<string, { usd: number; locked: number}> = {
  "1":{
    usd:5000,
    locked:0
  }
}; // userId -> {usd, locked};
export const openOrders: any = [];
