const express = require("express");
const path = require("path");
const uuidv4 = require( 'uuid/v4');
const multer = require("multer");
const fs = require("fs");
const MedicalDetails = require("../schemas/medical-details-model");
const PatientDetails = require("../schemas/patient-details-model");
const model = require("../schemas/transaction-model");
const axios = require("axios");

const getNodeIdentifier = require("../utils");
const initiateTransaction = require("../inititate-transaction");


const storage = multer.diskStorage({
  destination: "reports",
  filename: (req, file, cb) => {
    cb(undefined, file.originalname);
  },
});

const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.endsWith("json") && !file.originalname.endsWith("txt")) {
      return cb(new Error("Please upload a valid report file"));
    }
    cb(undefined, true);
  },
  limits: {
    fileSize: 20000,
  },
  storage,
});



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
    res.render("login/hospital");
  });

  router.get("/hospital-login", (req, res) => {
    res.render("login/hospital");
  });

  router.get("/patient-login", (req, res) => {
    res.render("login/signature-check");
  });

  router.post("/applicant-details", (req, res) => {
    axios
      .get(`http://127.0.0.1:8085/genKeyPair?uuid=${req.body.uuid}`)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    const verify = {
      status: "success",
    };
    console.log(verify);
    res.render("details/applicant-details");
  });

  router.post("/processing", (req, res) => {
    const uuid = req.body.uuid;
    const ruid = req.body.ruid;
    const name = req.body.name;
    const dob = req.body.dob;
    const address = req.body.address;
    const pnum = req.body.pnum;

    axios
      .get(`http://127.0.0.1:8085/genKeyPair?uuid=${ruid}`)
      .then((res) => {
        console.log(ruid + " - ruid key pair generated");
      })
      .catch((err) => {
        console.log(err);
      });

    const personalDetails = {
      uuid,
      ruid,
      name,
      dob,
      address,
      pnum,
    };
    new PatientDetails(personalDetails)
      .save()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err + "error in saving PatientDetails");
      });
    console.log("Personal Data Stored in DB");

    res.render("loader/processing");
  });

  router.get("/medical-details", (req, res) => {
    res.render("details/medical-details");
  });

  router.post("/processsing", upload.array("reports",3),async (req, res) => {
    const status = req.body.exist;
    const uuid = req.body.uuid;
    const duid = req.body.duid;
    const diabetesLevel = req.body.diabetes_level;
    const bpLevel = req.body.bp_level;
    const otherDetails = req.body.details;

    const medicalDetails = {
      _id: uuid,
      duid,
      diabetesLevel,
      bpLevel,
      otherDetails,
    };

    console.log("Initiated new transaction");
    console.log(medicalDetails);

    // generateDocKey(duid);
    await axios.get(`http://127.0.0.1:8085/genKeyPair?uuid=${duid + "_doc"}`);

    fs.writeFileSync(
      path.join(
        __dirname,
        "../../encrypted-files",
        `${uuid}-medical-report.json`
      ),
      JSON.stringify(medicalDetails)
    );
    initiateTransaction(uuid, duid, blockchain);
    const response = {
      message: "Transaction will be added to The Blockchain",
    };

    console.log(response);

    new MedicalDetails(medicalDetails)
      .save()
      .then()
      .catch((err) => {
        console.log(err + "error occured in saving medical details");
      });

    res.render("loader/processing");
  });

  router.get("/hospital-dashboard", (req, res) => {
    res.render("hospital-dashboard/dashboard");
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
    console.log("transactions info -> ",block[blockNumber].transactions);
    res.render("chain-details/transaction-info", {
      transaction: block[blockNumber].transactions,
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
      id: uuidv4().replace(/-/g, '') ,
      messageData: "http://127.0.0.1:"+process.env.PORT,
      senderName: "Cauveru Group of hospitals",
    });
    res.status(201).send({status:"success",message:"Registered Node"})
  });

  return router;
};



module.exports = getApp;
