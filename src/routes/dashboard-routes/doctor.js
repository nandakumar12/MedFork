const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { MedicalDetials } = require("../../schemas/medical-details-model");
const PatientDetails = require("../../schemas/patient-details-model");
const DoctorRegistrationDetails = require("../../schemas/doctor-registration-schema");
const HospitalRegistrationDetails = require("../../schemas/hospital-registration-model");
const model = require("../../schemas/transaction-model");

const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const { deepParseJson } = require("deep-parse-json");

const initiateTransaction = require("../../inititate-transaction");
const { captureRejectionSymbol } = require("events");

const storage = multer.diskStorage({
  destination: "reports",
  filename: (req, file, cb) => {
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
  
  let hospitalDetails;
  let doctorDetails;
  let sharedRecords;

  router.post("/", async (req,res) => {
    await HospitalRegistrationDetails.findOne(
      { _id: req.body.login },
      (err, hospital) => {
        if (err) {
          console.log("Error during retriving hospital data from DB", err);
          return;
        }
        hospitalDetails = hospital;
        console.log(hospitalDetails);
      }
    );
    if (
      req.body.login == hospitalDetails._id &&
      req.body.password == hospitalDetails.hospitalPassword
    ) {
      res.render("dashboard-hospital/dashboard", {
        hospitalName: hospitalDetails.hospitalName,
        hospitalRegNo: hospitalDetails._id,
      });
    } else {
      res.redirect(`hospital-login&valid=${false}`);
    }
  });

  router.get("/", (req, res) => {
    res.render("dashboard-hospital/dashboard", {
      hospitalName: hospitalDetails.hospitalName,
      hospitalRegNo: hospitalDetails._id,
    });
  });

  router.get("/about", (req, res) => {
    res.render("dashboard-hospital/about", {
      _id: hospitalDetails._id,
      hospitalName: hospitalDetails.hospitalName,
      hospitalAccrediation: hospitalDetails.hospitalAccrediation,
      hospitalAddress: hospitalDetails.hospitalAddress,
      hospitalPnum: hospitalDetails.hospitalPnum,
    });
  });

  router.get("/doctor-registration", (req,res) => {
    res.render("dashboard-hospital/doctor-registration");
  });

  router.post("/doctor-processing", async (req,res) => {
    new DoctorRegistrationDetails({
      doctorName: req.body.doctorName,
      doctorRegNo: req.body.doctorRegNo,
      doctorYearReg: req.body.doctorYearReg,
      stateMedicalCouncil: req.body.stateMedicalCouncil,
      doctorGender: req.body.doctorGender,
      doctorPnum: req.body.doctorPnum
    }).save()
    .then((res) => {
      console.log("The doctor data is",res);
    })
    .catch((err) => {
      console.log(err + "error in saving Doctor Details");
    });
    console.log("After catch");

    // generateDocKey(duid);
    await axios.get(`http://127.0.0.1:8085/genKeyPair?uuid=${req.body.doctorRegNo + "_doc"}`);

    res.render("loader/hospital-processing");
  });

  router.get("/doctor-list", (req,res) => {
    DoctorRegistrationDetails.find({}).lean().exec((err, doctor) => {
      doctorDetails = doctor
      console.log("doctor details",doctorDetails);
      res.render("dashboard-hospital/doctor-list", {
        doctorDetails,
      });
    });
  })

  return router;
};

module.exports = getHospitalRoute;
