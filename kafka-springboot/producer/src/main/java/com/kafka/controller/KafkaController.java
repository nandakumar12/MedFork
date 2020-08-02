package com.kafka.controller;


//public class KafkaController {
//
//	@Autowired
//	KafkaSender kafkaSender;
//	@PostMapping(value = "/producer")
//	public String producer(@RequestBody String message) {
//		kafkaSender.send(message);
//		System.out.println("Message sent");
//
//		return "Message sent to the Kafka Topic 'messages' Successfully";
//	}
//
//}


import com.message.model.MessageModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Service
@RestController
public class KafkaController {

    private static final Logger LOG = LoggerFactory.getLogger(ProducerSerialize.class);

    @Autowired
    private KafkaTemplate<String, MessageModel> kafkaTemplate;

    private String topic="messages2";
    
    @PostMapping(value = "/producer",consumes = "application/json")
    public void send(@RequestBody MessageModel data){
    	LOG.info("hello");
        LOG.info("sending data='{}' to topic='{}'", data, topic);
        Message<MessageModel> message = MessageBuilder
                .withPayload(data)
                .setHeader(KafkaHeaders.TOPIC, topic)
                .build();
        LOG.info("SENT MSG");
    	System.out.println("doneeee"+data);

        
        kafkaTemplate.send(message);
    }
}

