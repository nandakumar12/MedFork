const { Kafka } = require("kafkajs");
const axios = require("axios");

let currentTransactions = [];

const kafka = new Kafka({
  brokers: ["localhost:9092"],
  clientId: "kafka-orderer",
});

const topic = "transaction";
const consumer = kafka.consumer({ groupId: "group-3" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });
  await consumer.run({
    // eachBatch: async ({ batch }) => {
    //   console.log(batch)
    // },
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);
      currentTransactions.push(JSON.parse(message.value).messageData);
      console.log("New transaction is sent to orderer");
    },
  });
};
run().catch((e) => console.error(`[example/consumer] ${e.message}`, e));


const blockBuilder = () => {
  console.log("Orderer waiting for Transaction")
  if (currentTransactions.length != 0) {
    const blockTransactions = {
      timestamp: Date.now(),
      transactions: JSON.stringify(currentTransactions),
    };
    console.log("The transaction inside orderer", currentTransactions);
    axios.post("http://127.0.0.1:9050/produce/block", {
      id: "435",
      messageData: JSON.stringify(blockTransactions),
      senderName: "sdfsdf",
    });
    currentTransactions=[]
  }
};

setInterval(blockBuilder, 10000);
