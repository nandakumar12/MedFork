package com.medfork.kafkaspringboot.services;
import java.util.Random;

import com.medfork.kafkaspringboot.model.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;


@Service
public class MessageDispatcherService {

    private static final Logger LOG = LoggerFactory.getLogger(MessageDispatcherService.class);

    @Autowired
    private KafkaTemplate<String, Message> kafkaTemplate;

    private Random random = new Random();


    @Async
    public void dispatchMessage( Message data,  String topic)  {
            int id = random.nextInt(10);
            LOG.debug("Current thread --> '{}'", Thread.currentThread().getName());
            LOG.debug("sending data='{}' to topic='{}'", data, topic);
            ListenableFuture<SendResult<String, Message>> future = kafkaTemplate.send(topic, "id_"+id, data);
            future.addCallback(new ListenableFutureCallback<SendResult<String, Message>>() {
                @Override
                public void onSuccess(SendResult<String, Message> result) {
                    LOG.info("Sent message=[{}] offset=[{}] partition=[{}]",data,
                            result.getRecordMetadata().offset(),
                            result.getRecordMetadata().partition());
                }

                @Override
                public void onFailure(Throwable ex) {
                    LOG.info("Unable to send message=[{}] due to : {}",data,ex.getMessage());
                }

            });
        }




}
