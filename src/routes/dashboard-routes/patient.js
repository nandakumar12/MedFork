const express = require("express");
const axios = require("axios");
const PatientDetails = require("../../schemas/patient-details-model");
const fs = require("fs");

const getPatientRoute = () => {
  const router = express.Router();
  let patientDetails;

  router.post("/", async(req, res) => {
    const uid = req.body.uid;
    console.log(req.body.uid);
    await PatientDetails.findOne({ uuid: uid }, (err, patient) => {
      if (err) {
        console.log("Error during retriving patient data from DB", err);
        return;
      }
      patientDetails = patient;
      console.log(patientDetails);
    });
    const password = req.body.password;
    if (password == "password") {
      res.render("dashboard-patient/dashboard", {
        patientName: patientDetails.name,
        patientUID: patientDetails.uuid,
      });
    } else {
      res.redirect("http://127.0.0.1:8081/patient-login");
    }
  });

  router.get("/", (req, res) => {
    res.render("dashboard-patient/dashboard");
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
    res.render("dashboard-patient/prescription");
  });

  router.get("/appoinment", (req, res) => {
    res.render("dashboard-patient/appoinment");
  });

  router.get("/hospital", (req, res) => {
    res.render("dashboard-patient/hospital");
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
    res.render("dashboard-patient/diabetes");
  });

  router.get("/bp-report", (req, res) => {
    res.render("dashboard-patient/bp");
  });

  return router;
};

module.exports = getPatientRoute;
