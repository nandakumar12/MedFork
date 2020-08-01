const mongoose = require("./mongoose-connection");
const Schema = mongoose.Schema;

const medicalDetialsSchema = mongoose.Schema({ 

  _id: {
    type: String,
    required: true,
    trim: true
  },

  duid: {
    type: String,
    required: true,
    trim: true,
  },

  diabetesLevel: {
    type: String,
    require: true,
    trim: true,
  },

  bpLevel: {
    type: String,
    required: true,
    trim: true,
  },

  otherDetails: {
    type: String,
    required: true,
    trim: true,
  }
});

const MedicalDetials = mongoose.model('MedicalDetials',medicalDetialsSchema);

module.exports = MedicalDetials;
