
 ![Medfork](https://user-images.githubusercontent.com/17951801/89218387-90b47d80-d5eb-11ea-9378-9acfdf6ad0ee.png)

# <center>MedFork - Blockchain based EHR<center>


This project uses poc blockchain implemention and other encryption techniques inorder to solve security and privacy issues in exisiting EHR systems.


## Requirements

 - Apache Kafka Zookeeper and Broker
 - MongoDB
 - Go-Ipfs client
 - Python
 - Node
 - Java

## Installation

### MongoDB

> mongod.exe --dbpath="database-path"

### GoIpfs Client
> ipfs init
> ipfs daemon

### Configuring Apache kafka

   #### Start Zookeeper:
- `bin/zookeeper-server-start.sh config/zookeeper.properties`
#### Start Kafka Server
- Configure multiple brokers with different `server.properties`
- `bin/kafka-server-start.sh config/server.properties`
#### Multithread configuration
Configure *`AsyncConfig.java`* in the below package
> /src/main/java/com.medfork.kafkaspringboot/configuration/
### Excecute the below files

    python /src/api/encrypt/data_sharing_helpers.py
    python /src/api/encrypt/encrypt-rest.py
    python /src/api/ipfs/ipfsClient.py
    node /ordering service/orderer.js
## To execute in developement environment

    npm run dev

## Data Storage Mechanism
![Medfork](https://user-images.githubusercontent.com/17951801/89218985-9a8ab080-d5ec-11ea-91d0-c3e8562dd18f.png)

## Encryption Technique
![Medfork](https://user-images.githubusercontent.com/17951801/89219160-ea697780-d5ec-11ea-9b08-c486b6791acc.png)
## Transactions and Ordering
![Medfork](https://user-images.githubusercontent.com/17951801/89219302-213f8d80-d5ed-11ea-927b-7ae46d464579.png)
