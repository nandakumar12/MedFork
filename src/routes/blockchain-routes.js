const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const getNodeIdentifier = require("../utils");
const fs = require("fs");
const initiateTransaction = require("../inititate-transaction");
const path = require("path");
const axios = require("axios");

const getApp = (blockchain) => {
  if (!blockchain) {
    throw new Error("You must send a blockchain instance");
  }

  const nodeIdentifier = getNodeIdentifier();
  const router = express.Router();

  const upload = multer(); // for parsing multipart/form-data
  router.use(bodyParser.json()); // for parsing application/json
  router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  router.get("/mine", (req, res) => {
    const lastBlock = blockchain.lastBlock();
    const lastProof = lastBlock.proof;
    const proof = blockchain.proofOfWork(lastProof);
    const previousHash = blockchain.hash(lastBlock);
    const block = blockchain.newBlock(proof, previousHash);

    const response = {
      message: "New Block Forged",
      ...block,
    };

    res.send(response);
  });

  router.post("/transactions/new", upload.array(), (req, res) => {
    console.log("initiated new transaction");
    const { uid, duid, medicalDetials } = req.body;
    console.log(uid, duid, medicalDetials);
    // Implement the logic
    fs.writeFileSync(
      path.join(
        __dirname,
        "../../encrypted-files",
        `${uid}-medical-report.json`
      ),
      JSON.stringify(medicalDetials)
    );
    /*
      initiateTransaction will process everything from reading the pubkeys 
      and inserting the transaction into blockchain
    **/
    initiateTransaction(uid, duid, blockchain);
    const response = {
      message: "Transaction will be added to The Blockchain",
    };
    res.status(201).send(response);
  });

  router.get("/chain", (req, res) => {
    const response = {
      chain: blockchain.chain,
      length: blockchain.chain.length,
    };
    res.send(response);
  });

  router.post("/nodes/register", (req, res) => {
    const nodes = req.body.nodes || [];
    console.log("Got a new node ", nodes);

    if (!nodes) {
      res.status(400).send("Error: Please supply a valid list of nodes");
      return;
    }

    nodes.forEach((node) => {
      blockchain.registerNode(node);
    });

    const response = {
      message: "New nodes have been added",
      totalNodes: blockchain.nodes.length,
    };

    res.status(201).send(response);
  });

  router.get("/chain-length", (req, res) => {
    return res.send({
      chainLength: blockchain.chainLength,
    });
  });

  router.post("/Policy", (req, res) => {
    axios
      .post("http://127.0.0.1:8099/newPolicy", {
        s_uid: req.body.senderUID,
        r_uid: req.body.receiverUID,
        data_hash: req.body.dataHash,
        public_key_digitalsign: req.body.pubKeyDigitalSign,
        capsule: req.body.capsule,
        remove: req.body.remove,
      })
      .then((res) => {
        if (res.status == "success" && remove == 1) {
          blockchain.newPolicyTransaction({
            senderUID: req.body.senderUID,
            receiverUID: req.body.receiverUID,
            dataHash: req.body.dataHash,
            capsule: req.body.capsule,
            remove: req.body.remove,
          });
        }
        if(res.status == "success" && remove== 0 ){
          blockchain.newPolicyRemoveTransaction({senderUID,receiverUID,dataHash });
        }
      })
      .catch((err) => {
        console.log("Error during creating new policy");
      });
  });

  router.post("/reEncrypt", async (req, res) => {
    // Need to check whether the policy access is revoked or not (should be implemented)
    const sharedData = await axios.post("http://127.0.0.1:8099/reEncrypt", {
      s_uid: req.body.senderUID,
      r_uid: req.body.receiverUID,
      public_key_digitalsign: req.body.pubKeyDigitalSign,
    });
    res.status(201).send({
      decryptionStatus: "Successful",
      sharedData,
    });
  });

  router.get("/nodes/resolve", (req, res) => {
    let response;
    blockchain
      .resolveConflicts()
      .then((replaced) => {
        if (replaced) {
          response = {
            message: "Our chain was replaced",
            newChain: blockchain.chain,
          };
        } else {
          response = {
            message: "Our chain is authoritative",
            chain: blockchain.chain,
          };
        }

        res.send(response);
      })
      .catch(() => {
        res.status(502).send("Failed to contact nodes");
      });
  });

  return router;
};

module.exports = getApp;