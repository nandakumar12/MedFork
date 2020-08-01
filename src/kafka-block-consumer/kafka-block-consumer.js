const { Kafka } = require("kafkajs");
const { deepParseJson } = require('deep-parse-json')


const getApp = (blockchain) => {

  const kafka = new Kafka({
    brokers: ["localhost:9092"],
    clientId: "kafka-block-consumer",
  });

  const topic = "block";
  const consumer = kafka.consumer({ groupId: "group-2" });

  const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({
      // eachBatch: async ({ batch }) => {
      //   console.log(batch)
      // },
      eachMessage: async ({ topic, partition, message }) => {
        console.log("Kafka-block-consumer got new block",deepParseJson(message.value.toString()) );
        blockchain.newBlock(deepParseJson(message.value.toString()).messageData);
      },
    });
  };
  run().catch((e) => console.error(`[kafka-block/consumer] ${e.message}`, e));

  // consumer.on("message", function (message) {
  //   console.log("Message: ", message.value);
  //   blockchain.newBlock(JSON.parse(message.value).messageData.blockTransactions)
};

module.exports = getApp;
