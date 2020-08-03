const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { MedicalDetials } = require("../../schemas/medical-details-model");
const PatientDetails = require("../../schemas/patient-details-model");
const DoctorRegistrationDetails = require("../../schemas/doctor-registration-schema");
const model = require("../../schemas/transaction-model");

const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const { deepParseJson } = require("deep-parse-json");

const initiateTransaction = require("../../inititate-transaction");
const { captureRejectionSymbol } = require("events");
const { RSA_NO_PADDING } = require("constants");

const storage = multer.diskStorage({
  destination: "reports",
  filename: (req, file, cb) => {
    console.log("filesss came............");
    cb(undefined, file.originalname);
  },
});

const upload = multer({
  fileFilter(req, file, cb) {
    if (
      !file.originalname.endsWith("json") &&
      !file.originalname.endsWith("txt")
    ) {
      return cb(new Error("Please upload a valid report file"));
    }
    cb(undefined, true);
  },
  limits: {
    fileSize: 20000,
  },
  storage,
});

const getHospitalRoute = (blockchain) => {
  const router = express.Router();

  let doctorDetails;
  let sharedRecords;

  router.post("/", async (req, res) => {
    // Login credentials verify
    console.log(req.body.duid, req.body.random_nos, req.body.digital_signature);
    const isValidSignature = await axios.post(
      "http://127.0.0.1:8085/verify-sign",
      {
        uid: req.body.duid + "_doc",
        text_data: req.body.random_nos,
        signature: req.body.digital_signature,
      }
    );

    if (!isValidSignature.data.status) {
      res.redirect(`/signature-check-doctor&valid=${false}`);
    }

    console.log("signature validity -> ", isValidSignature);

    await DoctorRegistrationDetails.findOne(
      { doctorRegNo: req.body.duid },
      (err, doctor) => {
        if (err) {
          console.log("Error during retriving hospital data from DB", err);
          return;
        }
        doctorDetails = doctor;
        console.log(doctorDetails);
      }
    );
    res.render("dashboard-doctor/dashboard", {
      doctorName: doctorDetails.doctorName,
      doctorRegNo: doctorDetails.doctorRegNo,
    });
  });

  router.get("/", (req, res) => {
    res.render("dashboard-doctor/dashboard", {
      doctorName: doctorDetails.doctorName,
      doctorRegNo: doctorDetails.doctorRegNo,
    });
  });

  router.get("/about", (req, res) => {
    res.render("dashboard-doctor/about", {
      doctorRegNo: doctorDetails.doctorRegNo,
      doctorName: doctorDetails.doctorName,
      doctorYearReg: doctorDetails.doctorYearReg,
      stateMedicalCouncil: doctorDetails.stateMedicalCouncil,
      doctorGender: doctorDetails.doctorGender,
      doctorPnum: doctorDetails.doctorPnum,
    });
  });

  router.get("/key-generation", (req, res) => {
    res.render("key-generation/key-generation");
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

  router.post("/applicant-processing", (req, res) => {
    const uuid = req.body.uuid;
    const ruid = req.body.ruid;
    const name = req.body.name;
    const gender = req.body.gender;
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
      gender,
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

    res.render("loader/doctor-loader");
  });

  router.get("/medical-details", (req, res) => {
    res.render("details/medical-details");
  });

  router.post("/processsing", upload.array("reports", 3), async (req, res) => {
    console.log("inside processsss");
    const status = req.body.exist;
    const uuid = req.body.uuid;
    const duid = req.body.duid;
    const otherDetails = req.body.details;

    const patientMedicalReport = [];
    console.log("the files are ", req.files);

    for (const file of req.files) {
      patientMedicalReport.push(readFile(`./reports/${file.filename}`));
    }
    Promise.all(patientMedicalReport).then((resArr) => {
      console.log("The final report is :");
      const medicalReportData = [];
      resArr.forEach((fileContent) => {
        console.log("Single content", JSON.parse(fileContent.toString()));
        medicalReportData.push(JSON.parse(fileContent.toString()));
      }); //deepParseJson
      console.log(medicalReportData);

      const prescriptionDetails = [];
      medicalReportData[1].prescription.forEach((el) => {
        prescriptionDetails.push(el);
      });

      const fullMedicalData = {
        duid,
        diabetesLevel: [
          {
            beforeFasting: medicalReportData[0].sugarData.beforeFasting,
            afterFasting: medicalReportData[0].sugarData.afterFasting,
          },
        ],
        bpLevel: medicalReportData[2].bpData,
        prescriptionDetails,
        otherDetails,
        hospitalRegNo: medicalReportData[0].hospitalRegNo,
        hospitalName: medicalReportData[0].hospitalName,
        date: new Date().toDateString(),
      };

      console.log("The builded medical report", fullMedicalData);

      if (status == "exist2") {
        new MedicalDetials({
          _id: uuid,
          furtherDetails: [fullMedicalData],
        })
          .save()
          .then()
          .catch((err) => {
            console.log(err + "error occured in saving medical details");
          });
      } else if (status == "exist1") {
        MedicalDetials.findById(uuid, (err, patient) => {
          patient.furtherDetails.push(fullMedicalData);
          patient
            .save()
            .then(() => {
              console.log(
                "database updated with new medical records successfully"
              );
            })
            .catch((err) => {
              console.log(err + "error occured in saving medical details");
            });
        });
      }

      const medicalDetails = {
        _id: uuid,
        duid: fullMedicalData.duid,
        diabetesLevel: fullMedicalData.diabetesLevel,
        bpLevel: fullMedicalData.bpLevel,
        prescriptionDetails: fullMedicalData.prescriptionDetails,
        otherDetails: fullMedicalData.otherDetails,
        hospitalRegNo: fullMedicalData.hospitalName,
        hospitalName: fullMedicalData.hospitalName,
        date: fullMedicalData.date,
      };
      writeFile(
        path.join(
          __dirname,
          "../../../encrypted-files",
          `${uuid}-medical-report.json`
        ),
        JSON.stringify(medicalDetails)
      )
        .then((res) => {
          console.log("The medical data is generated");
          console.log("Initiated new transaction");
          initiateTransaction(uuid, duid, blockchain);
        })
        .catch((err) => {
          console.log("Error while parsing the medical record", err);
        });
    });

    const response = {
      message: "Transaction will be added to The Blockchain",
    };

    console.log(response);

    res.render("loader/doctor-loader");
  });

  router.get("/shared-data", (req, res) => {
    res.render("dashboard-doctor/shared-data", {
      error: " ",
    });
  });

  router.post("/shared-records", (req, res) => {
    const patientUID = req.body.patient_uuid;
    const doctorUID = req.body.doctor_uuid;
    const dataHash = req.body.data_hash;
    console.log("-> ", patientUID, doctorUID, dataHash);

    for (let blockNo = blockchain.chain.length - 1; blockNo >= 0; blockNo--) {
      console.log(blockchain.chain);
      const transactions = blockchain.chain[blockNo].transactions;
      for (let idx = 0; idx < transactions.length; idx++) {
        if (transactions[idx].transactionType == "policy") {
          const currentTransaction =
            blockchain.chain[blockNo].transactions[idx];
          if (
            currentTransaction.senderUID == patientUID &&
            currentTransaction.receiverUID == doctorUID &&
            currentTransaction.dataHash == dataHash &&
            currentTransaction.remove == true
          ) {
            res.render("dashboard-doctor/shared-data", {
              error: "Patient revoked access!!",
            });
            return console.log("Sorry the paient has revoked access");
          }
        }
      }
    }

    axios.post("http://127.0.0.1:8099/reEncrypt", {
        s_uid: patientUID,
        r_uid: doctorUID,
        public_key_digitalsign: dataHash,
      })
      .then((result) => {
        console.log("result -> ", res);
        if (result.data.status == "success") {
          console.log("responce from datasharing -> ",result.data.decryptedMessage);
          sharedRecords = deepParseJson(result.data.decryptedMessage);
          res.render("dashboard-doctor/shared-reports", {
            uid: sharedRecords._id,
            duid: sharedRecords.duid,
            diabetesLevel: sharedRecords.diabetesLevel,
            bpLevel: sharedRecords.bpLevel,
            prescriptionDetails: sharedRecords.prescriptionDetails,
            hospitalName: sharedRecords.hospitalName,
            date: sharedRecords.date
          });
          return ;
        }
      });
  });

  return router;
};

module.exports = getHospitalRoute;
