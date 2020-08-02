package com.medfork.kafkaspringboot.controllers;

import com.medfork.kafkaspringboot.services.TextDataParser;
import com.medfork.kafkaspringboot.model.Message;
import com.medfork.kafkaspringboot.services.FileParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import java.io.IOException;

@RestController
public class KafkaController {

    @Autowired
    FileParser parseAndDispatch;

    @Autowired
    TextDataParser dataDispatch;
   //            @RequestParam (value = "file") MultipartFile file,
    @PostMapping (value="/produce/{topic}", consumes={MediaType.MULTIPART_FORM_DATA_VALUE,MediaType.APPLICATION_JSON_VALUE})
    public  ResponseEntity<String> uploadFile(
            @RequestBody Message data,
            @PathVariable String topic) throws IOException {
        //if(file)
        //parseAndDispatch.parseFile(file, topic);
        //else
        dataDispatch.parseData(data, topic);

        return new ResponseEntity<>("Message Sent", HttpStatus.OK);
    }
}


