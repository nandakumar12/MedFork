const express = require("express");
const uuidv4 = require("uuid/v4");
const multer = require("multer");
const fs = require("fs");

const HospitalRegistrationDetails = require("../schemas/hospital-registration-model");

const model = require("../schemas/transaction-model");
const axios = require("axios");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const { deepParseJson } = require("deep-parse-json");

const getNodeIdentifier = require("../utils");
const initiateTransaction = require("../inititate-transaction");
const { captureRejectionSymbol } = require("events");

const getApp = (blockchain) => {
  if (!blockchain) {
    throw new Error("You must send a blockchain instance");
  }
  const router = express.Router();

  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get("/login", (req, res) => {
    res.render("login/login");
  });

  router.get("/hospital-registration", (req, res) => {
    res.render("register/hospital-registration");
  });

  router.post("/hospital-register-process", (req, res) => {
    const hospitalDetails = {
      _id: req.body.hospitalRegno,
      hospitalName: req.body.hospitalName,
      hospitalAccrediation: req.body.hospitalAccreditation,
      hospitalAddress: req.body.hospitalAddress,
      hospitalPnum: req.body.hospitalPnum,
      hospitalPassword: req.body.hospitalPassword,
    }

    new HospitalRegistrationDetails(hospitalDetails)
      .save().then((res) => {
        console.log("hospital registration details updated successfully",res);
      }).catch(err => {
        console.log("error occured during updating db",err);
      });
    res.render("loader/hospital-reg-processing");
  });

  router.get("/hospital-login", (req, res) => {
    res.render("login/hospital");
  });

  router.get("/hospital-login&valid=false", (req, res) => {
    res.render("login/hospital", {
      error: "Invalid Crediantials.."
    });
  });

  router.get("/signature-check", (req, res) => {
    res.render("login/signature-check", {
      loginError: ""
    });
  });

  router.get("/signature-check&valid=false", (req, res) => {
    res.render("login/signature-check", {
      loginError: "Invalid User Id"
    })
  })

  router.get("/signature-check-doctor",(req,res) => {
    res.render("login/signature-checker-doctor", {
      loginError: " "
    });
  });

  router.get("/signature-check-doctor&valid=false",(req,res) => {
    res.render("login/signature-checker-doctor", {
      loginError: "Invalid Doctor Id"
    });
  });

  router.post("/patient-login", async (req, res) => {
    const uid = req.body.uid;
    const randomNum =
      Math.floor(Math.random() * (999999999 - 111111111 + 1)) + 111111111;
    let digitalSignature = await axios.get(
      `http://127.0.0.1:8085/digital-sign?uid=${uid}&text_data=${randomNum}`
    );
    console.log("digital sign patient-> ", digitalSignature.data.status);
    if (digitalSignature.data.status == false) {
        res.redirect(`/signature-check&valid=${false}`);
    } else {
      res.render("login/patient", {
        uid,
        randomNum,
        digitalSignature: digitalSignature.data,
      });
    }
  });

  router.post("/doctor-login", async (req, res) => {
    const duid = req.body.duid;
    const randomNum =
      Math.floor(Math.random() * (999999999 - 111111111 + 1)) + 111111111;
    let digitalSignature = await axios.get(
      `http://127.0.0.1:8085/digital-sign?uid=${duid}_doc&text_data=${randomNum}`
    );
    console.log("digital sign doctor-> ", digitalSignature.data);
    if (digitalSignature.data.status == false) {
      res.redirect(`/signature-check-doctor&valid=${false}`);
    } else {
      res.render("login/doctor", {
        duid,
        randomNum,
        digitalSignature: digitalSignature.data,
      });
    }
  });


  router.get("/hospital-dashboard", (req, res) => {
    res.render("dashboard-hospital/dashboard");
  });

  router.get("/mine", (req, res) => {
    const lastBlock = blockchain.lastBlock;
    const proof = blockchain.proofOfWork(lastBlock);
    const previousHash = blockchain.hash(lastBlock);
    const block = blockchain.newBlock(proof, previousHash);
    block.transactions.forEach((transaction) => {
      new model.TransactionModel({
        uuid: transaction.uuid,
        transactions: transaction,
      })
        .save()
        .then()
        .catch((err) => {
          console.log(
            err + "Error occured while saving transaction details to DB"
          );
        });
    });
    const response = {
      message: "New Block Added",
      index: block.index,
      transactions: block.transactions,
      proof: block.proof,
      previousHash: block.previousHash,
    };
    console.log("transactions -", block.transactions);
    console.log(response);
    res.render("mine/mine");
  });

  router.get("/full-chain", (req, res) => {
    const chain = blockchain.chain;
    const length = blockchain.chain.length;
    response = {
      chain,
      length,
    };
    console.log(response);
    res.render("chain-details/full-chain", {
      fullChain: chain,
      chainLength: length,
    });
  });

  router.get("/transaction-info", (req, res) => {
    const block = blockchain.chain;
    console.log(block);
    const blockNumber = req.query.blockNumber;
    console.log(blockNumber);
    res.render("chain-details/transaction-info", {
      transaction: block[blockNumber - 1].transactions,
    });
  });

  router.post("/fetching-block", (req, res) => {
    if (req.body.blockNo <= blockchain) res.render("loader/processing");
  });

  router.get("/block", (req, res) => {
    blockchain;
    req.query.blockNumber;
  });

  router.get("/register-node", (req, res) => {
    axios.post("http://localhost:9050/produce/new_topic1", {
      id: uuidv4().replace(/-/g, ""),
      messageData: "http://127.0.0.1:" + process.env.PORT,
      senderName: "Cauveru Group of hospitals",
    });
    res.status(201).send({ status: "success", message: "Registered Node" });
  });

  return router;
};

module.exports = getApp;
