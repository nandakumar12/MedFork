const axios = require("axios");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  brokers: ["localhost:9092"],
  clientId: "kafka-new-node-consumer",
});

const topic = "new_topic1";
const consumer = kafka.consumer({ groupId: "group-1" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });
  await consumer.run({
    // eachBatch: async ({ batch }) => {
    //   console.log(batch)
    // },
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${message.key}#${message.value}`);
      axios
        .post("http://127.0.0.1:8081/blockchain/nodes/register", {
          nodes: [JSON.parse(message.value).messageData],
        })
        .then((res) => {
          console.log("New hospital node details sent");
        })
        .catch((err) => {
          console.log("cant able to publish the Hospital node info", err);
        });
    },
  });
};
run().catch((e) => console.error(`[example/consumer] ${e.message}`, e));
