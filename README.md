<center>![output-onlinepngtools](https://user-images.githubusercontent.com/17951801/89218387-90b47d80-d5eb-11ea-9378-9acfdf6ad0ee.png)<center>

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

