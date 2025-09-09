import { client } from "./redis.ts";

export class RedisSubscriber {
  private pending: Record<string, (data: any) => void> = {};

  async start() {
    console.log("started");
    let lastId = "$";
    while (true) {
      try {
        const response = await client.xRead(
          { key: "callback", id: lastId },
          { BLOCK: 0, COUNT: 1 }
        );

        if (!response) continue;
        console.log(response[0].messages);
        for (const msg of response[0].messages) {
          lastId = msg.id;

          const tradeId = msg.message.tradeId;
          const resolver = this.pending[tradeId];

          if (resolver) {
            resolver(msg.message);
            delete this.pending[tradeId];
          }
        }
      } catch (err) {
        console.error("Error in RedisSubscriber.listen:", err);
      }
    }
  }

  waitForTrade(tradeId: string): Promise<any> {
    return new Promise((resolve) => {
      this.pending[tradeId] = resolve;
    });
  }
}
