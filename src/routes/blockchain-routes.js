const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path= require("path");


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
    initiateTransaction(uid, duid, blockchain, ipfs);
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

  router.post("/nodes/register", upload.array(), (req, res) => {
    const { nodes } = req.body || [];

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

  return router;
};

module.exports = getApp;
