const express = require("express");
const axios = require("axios");
const fs = require("fs");

const getHospitalRoute = () => {
    const router = express.Router();

    router.post("/", (req, res) => {
        const login = req.body.login;
        const password = req.body.password;
        if (login == "admin" && password == "password") {
            res.render("dashboard-hospital/dashboard", {
                patientName: "Hospital",
                patientEmail: "user@gmail.com",
            });
        } else {
            res.redirect("http://127.0.0.1:8081/hospital-login");
        }
    });

    router.get("/", (req,res) => {
        res.render("dashboard-hospital/dashboard", {
            patientName: "Hospital",
            patientEmail: "user@gmail.com",
        });
    })

    router.get("/key-generation", (req, res) => {
        res.render("key-generation/key-generation");
    });

    

    return router;
};

module.exports = getHospitalRoute;
