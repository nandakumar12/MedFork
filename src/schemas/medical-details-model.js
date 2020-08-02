const mongoose = require("./mongoose-connection");

const prescriptionDetailsSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: String,
    required: true,
    trim: true,
  },
  when: {
    type: String,
    required: true,
    trim: true,
  },
});

const diabetesSchema = new mongoose.Schema({
  beforeFasting: {
    type: String,
    required: true,
    trim: true,
  },
  afterFasting: {
    type: String,
    required: true,
    trim: true,
  },
});

//const diabetesModel = mongoose.model("DiabetesDetials",diabetesSchema);

const furtherDetailsSchema = new mongoose.Schema({
  duid: {
    type: String,
    required: true,
    trim: true,
  },

  diabetesLevel: [diabetesSchema],

  bpLevel: {
    type: String,
    required: true,
    trim: true,
  },

  prescriptionDetails: [prescriptionDetailsSchema],

  otherDetails: {
    type: String,
    required: true,
    trim: true,
  },

  hospitalRegNo: {
    type: String,
    required: true,
    trim: true,
  },
  hospitalName: {
    type: String,
    required: true,
    trim: true,
  },

  date: {
    type: String,
    required: true,
    trim: true,
  },
});

const medicalDetialsSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  furtherDetails: [furtherDetailsSchema],
});

const MedicalDetials = mongoose.model("MedicalDetials", medicalDetialsSchema);
const FurtherDetails = mongoose.model("FurtherDetails", furtherDetailsSchema);

module.exports = {
  MedicalDetials,
  FurtherDetails,
};
