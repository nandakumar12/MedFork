const express = require("express");
const path = require("path");

const ipfs = require("../ipfs/ipfs");
const MedicalDetails = require("../schemas/medical-details-model");
const PatientDetails = require("../schemas/patient-details-model");
const TransactionDetails = require("../schemas/transaction-model");
const axios = require("axios");

// Directory Variable
const publicDirectory = path.join(__dirname, "../../views/layouts");
const detailsDirectory = path.join(__dirname, "../../views/details");
const loginDirectory = path.join(__dirname, "../../views/login");
const keygenDirectory = path.join(__dirname, "../../views/key-generation");


const getApp = (blockchain) =>{
  if (!blockchain) {
    throw new Error("You must send a blockchain instance");
  }
  const router = express.Router();

router.get("/", (req, res) => {
  res.render('index');
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(loginDirectory, "login.html"));
});

router.get("/hospital-registration", (req, res) => {
  res.sendFile(path.join(registerationDirectory, "hospital-registration.html"));
});

router.get("/hospital-login", (req, res) => {
  res.sendFile(path.join(loginDirectory, "hospital.html"));
});

router.get("/patient-login", (req, res) => {
  res.sendFile(path.join(loginDirectory, "patient.html"));
});

router.post("/applicant-details", (req, res) => {
  const uuid = req.body.uuid;
  encrypt.genKeypairs(uuid);
  const verify = {
    status: "success",
  };
  console.log(verify);
  res.sendFile(path.join(detailsDirectory, "applicant-details.html"));
});

router.post("/processing", (req, res) => {
  const uuid = req.body.uuid;
  const ruid = req.body.ruid;
  const name = req.body.name;
  const dob = req.body.dob;
  const address = req.body.address;
  const pnum = req.body.pnum;

  res.sendFile(path.join(loaderDirectory, "processing.html"));
});

router.get("/medical-details", (req, res) => {
  res.sendFile(path.join(detailsDirectory, "medical-details.html"));
});

router.post("/processsing", (req, res) => {
  const uuid = req.body.uuid;
  const duid = req.body.duid;
  const diabetesLevel = req.body.diabetes_level;
  const bpLevel = req.body.bp_level;
  const otherDetails = req.body.details;

  res.sendFile(path.json(loaderDirectory, "processing.html"));
});

router.get("/hospital-dashboard", (req, res) => {
  res.sendFile(path.join(dashboardDirectory, "hospital-dashboard.html"));
});

router.get("/mine", (req, res) => {
  res.sendFile(path.join(mineDirectory, "mine.html"));
});

router.post("/index", (req, res) => {
  const lastBlock = blockchain.lastBlock;
  const proof = blockchain.proofOfWork(lastBlock);
  const previousHash = blockchain.hash(lastBlock);
  const block = blockchain.newBlock(proof, previousHash);
  const response = {
    message: "New Block Added",
    index: block.index,
    transactions: block.transactions,
    proof: block.proof,
    previousHash: block.previousHash,
  };
  console.log(response);
  res.sendFile(path.join(publicDirectory, "index.html"));
});
}

module.exports = getApp;
