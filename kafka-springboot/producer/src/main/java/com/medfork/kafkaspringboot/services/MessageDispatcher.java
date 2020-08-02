package com.medfork.kafkaspringboot.services;

import com.medfork.kafkaspringboot.controllers.KafkaController;
import com.medfork.kafkaspringboot.model.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Service
public class MessageDispatcher {

    private static final Logger LOG = LoggerFactory.getLogger(KafkaController.class);

    @Autowired
    private KafkaTemplate<String, Message> kafkaTemplate;
    public void dispatchMesaage(Message data, String topic) {

        LOG.debug("sending data='{}' to topic='{}'", data, topic);
        ListenableFuture<SendResult<String, Message>> future = kafkaTemplate.send(topic, "id_1", data);
        future.addCallback(new ListenableFutureCallback<SendResult<String, Message>>() {

            @Override
            public void onSuccess(SendResult<String, Message> result) {
                System.out.println("Sent message=[" + data +
                        "] offset=[" + result.getRecordMetadata().offset() +
                        "] partition=[" + result.getRecordMetadata().partition() + "]");
            }

            @Override
            public void onFailure(Throwable ex) {
                System.out.println("Unable to send message=["
                        + data + "] due to : " + ex.getMessage());
            }

        });
    }
}
