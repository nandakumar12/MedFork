const mongoose = require("./mongoose-connection");
const Schema = mongoose.Schema;

const DoctorRegistrationSchema = mongoose.Schema({

  doctorName: {
    type: String,
    required: true,
    trim: true,
  },
  doctorRegNo: {
    type: String,
    required: true,
    trim: true,
  },
  doctorYearReg: {
    type: String,
    required: true,
    trim: true,
  },
  stateMedicalCouncil: {
    type: String,
    required: true,
    trim: true,
  },
  doctorGender: {
    type: String,
    required: true,
    trim: true,
  },
  doctorPnum: {
    type: String,
    required: true,
    trim: true,
  }
});

const DoctorRegistrationDetails = mongoose.model(
  "DoctorDetails",
  DoctorRegistrationSchema
);

module.exports = DoctorRegistrationDetails;
