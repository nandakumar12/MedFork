package com.medfork.kafkaspringboot.model;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Message {

	private String id;
	private String messageData;
	private String senderName;

}