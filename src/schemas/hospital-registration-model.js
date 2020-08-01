const mongoose = require("./mongoose-connection");
const Schema = mongoose.Schema;

const hospitalRegistrationSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },

  hospitalName: {
    type: String,
    required: true,
    trim: true,
  },
  hospitalAccrediation: {
    type: String,
    required: true,
    trim: true,
  },
  hospitalAddress: {
    type: String,
    required: true,
    trim: true,
  },
  hospitalFacilities: {
    type: String,
    required: true,
    trim: true,
  },
  hospitalPnum: {
    type: String,
    required: true,
    trim: true,
  },

  hospitalPassword: {
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    trim: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },
});

const HospitalRegistrationDetails = mongoose.model(
  "HospitalDetails",
  hospitalRegistrationSchema
);

module.exports = HospitalRegistrationDetails;
