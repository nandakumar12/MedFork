package com.message.model;

public class MessageModel {
	private String id;
	private String message;
	private String senderName;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getSenderName() {
		return senderName;
	}
	public void setSenderName(String senderName) {
		this.senderName = senderName;
	}
	
	public MessageModel() {
		super();
	}
	
	public MessageModel(String id, String message, String senderName) {
		super();
		this.id = id;
		this.message = message;
		this.senderName = senderName;
	}
	
	@Override
	public String toString() {
		return "Message [id=" + id + ", message=" + message + ", senderName=" + senderName + "]";
	}
	

}
