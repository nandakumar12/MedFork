const mongoose = require("./mongoose-connection");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  digitalSignDoctor: {
    type: String,
    required: true,
    trim: true,
  },

  digitalSignPatient: {
    type: String,
    require: true,
    trim: true,
  },

  publicKeyDoctor: {
    type: String,
    required: true,
    trim: true,
  },

  publicKeyPatient: {
    type: String,
    required: true,
    trim: true,
  },

  time: {
    type: String,
    required: true,
    trim: true,
  },

  modification: {
    type: String,
    required: true,
    trim: true,
  },

  ipfsFileHash: {
    type: String,
    required: true,
  },
  capsule: {
    type: String,
    required: true,
  },
});

const patientSchema = new Schema({
  uuid: {
    type: String,
    required: true,
    trim: true,
  },
  transactions: [transactionSchema],
});

const PatientModel = mongoose.model("PatientModel", patientSchema);
const TransactionModel = mongoose.model("TransactionModel", transactionSchema);

module.exports = {
  PatientModel,
  TransactionModel
};
