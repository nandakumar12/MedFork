let kafka = require("kafka-node");
const axios = require("axios");

const client = new kafka.KafkaClient({ kafkaHost: "127.0.0.1:9092" });

console.log("Initialised..");
const topics = [
  {
    topic: "new_topic1",
    offset: 3,
    partition: 0,
  },
];

const options = {
  autoCommit: true,
};

const consumer = new kafka.Consumer(client, topics, options);

consumer.setMaxListeners(11);

consumer.on("ready", function (message) {
  console.log("Kafka Consumer is ready");
});
consumer.on("message", function (message) {
  console.log("Message: ", message.value);
  axios.post("http://127.0.0.1:8081/blockchain/nodes/register", {
    nodes: [JSON.parse(message.value).messageData],
  }).then(res=>{
      console.log("New hospital node details sent")
  }).catch(err=>{
      console.log("cant able to publish the Hospital node info",err);
  });
});

consumer.on("error", function (err) {
  console.log("error", err);
});
