const express = require("express");
const axios = require("axios");
const PatientDetails = require("../../schemas/patient-details-model");
const { MedicalDetials } = require("../../schemas/medical-details-model");
const fs = require("fs");
const crypto = require("crypto");

const getPatientRoute = (blockchain) => {
  const router = express.Router();
  let patientDetails;
  let medicalDetails;
  let patientUUID;

  router.post("/", async (req, res) => {
    // Login credentials verify
    console.log(req.body.uid, req.body.random_nos, req.body.digital_signature);
    const isValidSignature = await axios.post(
      "http://127.0.0.1:8085/verify-sign",
      {
        uid: req.body.uid,
        text_data: req.body.random_nos,
        signature: req.body.digital_signature,
      }
    );

    if(!isValidSignature.data.status){
      res.redirect(`/signature-check&valid=${false}`);
    } 

    console.log("signature validity -> ", isValidSignature);

    // Getting Patient Details
    await PatientDetails.findOne(
      { uuid: req.body.uid },
      async (err, patient) => {
        if (err) {
          console.log("Error during retriving patient data from DB", err);
          return;
        }
        if (patient == null) {
          console.log("no data found !!");
          res.render("login/patient", {
            loginError: "Please enter a valid credential..",
          });
          return;
        }
        patientDetails = patient;
        patientUUID = patient.uuid;

        // Getting Medical Details
        await MedicalDetials.findOne({ _id: req.body.uid })
          .lean()
          .exec((err, details) => {
            if (err) {
              console.log("Error during retriving medical data from DB", err);
              return;
            }
            if (details == null) {
              res.render("dashboard-patient/dashboard", {
                patientName: patientDetails.name,
                patientUID: patientDetails.uuid,
              });
              return;
            }

            medicalDetails = details;
            console.log(medicalDetails);
            if (isValidSignature.data.status) {
              res.render("dashboard-patient/dashboard", {
                patientName: patientDetails.name,
                patientUID: patientDetails.uuid,
              });
            } else {
              res.render("login/patient", {
                loginError: "Please enter a valid credential..",
              });
            }
          });
      }
    );
  });

  router.get("/", (req, res) => {
    res.render("dashboard-patient/dashboard", {
      patientName,
      patientUID
    });
  });

  router.get("/about", (req, res) => {
    res.render("dashboard-patient/about", {
      patientUUID: patientDetails.uuid,
      patientName: patientDetails.name,
      patientAge: 2020 - new Date(patientDetails.dob).getFullYear(),
      patientGender: patientDetails.gender,
      patientAddress: patientDetails.address,
      patientPnum: patientDetails.pnum,
    });
  });

  router.get("/prescription", (req, res) => {
    const medicalData =
      medicalDetails === undefined ? " " : medicalDetails.furtherDetails;
    res.render("dashboard-patient/prescription", {
      medicalDetails: medicalData,
    });
  });

  router.get("/appoinment", (req, res) => {
    res.render("dashboard-patient/appoinment");
  });

  router.get("/hospital", (req, res) => {
    const medicalData =
      medicalDetails === undefined ? " " : medicalDetails.furtherDetails;
    res.render("dashboard-patient/hospital", {
      medicalDetails: medicalData,
    });
  });

  router.get("/clinic", (req, res) => {
    res.render("dashboard-patient/clinic");
  });

  router.get("/pharmacy", (req, res) => {
    res.render("dashboard-patient/pharmacy");
  });

  router.get("/laboratory", (req, res) => {
    res.render("dashboard-patient/laboratory");
  });

  router.get("/diabetes-report", (req, res) => {
    const medicalData =
      medicalDetails === undefined ? " " : medicalDetails.furtherDetails;
    res.render("dashboard-patient/diabetes", {
      medicalDetails: medicalData,
    });
  });

  router.get("/bp-report", (req, res) => {
    const medicalData =
      medicalDetails === undefined ? " " : medicalDetails.furtherDetails;
    res.render("dashboard-patient/bp", {
      medicalDetails: medicalData,
    });
  });

  router.get("/share-data", (req, res) => {
    console.log("share ->", patientUUID);
    res.render("dashboard-patient/share-data", {
      patientUUID,
    });
  });

  router.post("/patient", (req, res) => {
    let remove = 0;
    if (req.body.exist === "add") {
      remove = 0;
    } else {
      remove = 1;
    }
    console.log("chain -> ", blockchain.chain[1].transactions);
    let capsule = null;
    for (const block of blockchain.chain) {
      for (const transaction of block.transactions) {
        if (transaction.ipfsFileHash == req.body.ipfsHash) {
          capsule = transaction.capsule;
          break;
        }
      }
    }
    console.log("capsule -> ", capsule);
    if (capsule) {
      axios
        .post("http://127.0.0.1:8099/newPolicy", {
          s_uid: patientUUID,
          r_uid: req.body.duid,
          data_hash: req.body.ipfsHash,
          public_key_digitalsign: crypto
            .createHash("sha256")
            .update(capsule)
            .digest("hex"),
          capsule,
          remove,
        })
        .then((res) => {
          console.log(res);
          if (res.data.status == "success" && remove == 0) {
            console.log("sending new policy tranaction");
            blockchain.newPolicyTransaction({
              senderUID: patientUUID,
              receiverUID: req.body.duid,
              dataHash: req.body.ipfsHash,
              capsule,
              remove: false,
            });
          }
          else if (remove == 1) {
            console.log("revoking the policy");
            const chainLength = blockchain.newPolicyRemoveTransaction({
              senderUID: patientUUID,
              receiverUID: req.body.duid,
              dataHash: req.body.ipfsHash,
            });
            console.log(chainLength);
          }
        })
        .catch((err) => {
          console.log("Error during creating new policy", err);
        });
    }

    res.render("dashboard-patient/dashboard", {
      patientName: patientDetails.name,
      patientUID: patientDetails.uuid,
    });
  });

  return router;
};

module.exports = getPatientRoute;
