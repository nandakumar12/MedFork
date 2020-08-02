package com.medfork.kafkaspringboot.services;

import com.medfork.kafkaspringboot.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class TextDataParser {

    @Autowired
    MessageDispatcherService messageDispatcherService;

    public void parseData(Message data, String topic) throws IOException {
           messageDispatcherService.dispatchMessage(data, topic);

    }
}
