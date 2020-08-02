package com.medfork.kafkaspringboot.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medfork.kafkaspringboot.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * FileParser will parse the JSON file from Multipart
 * and dispatches the data to the Kafka producer instance
 * for the specified topic
 */

@Service
public class FileParser {

    @Autowired
    MessageDispatcherService messageDispatcherService;

    public void parseFile(MultipartFile file, String topic) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;
        String json = "";
        while ((line = br.readLine()) != null) {
            json = json.concat(line);
        }
        Message[] messages = objectMapper.readValue(json, Message[].class);
        for (Message data : messages) {
            messageDispatcherService.dispatchMessage(data, topic);
        }
    }
}
