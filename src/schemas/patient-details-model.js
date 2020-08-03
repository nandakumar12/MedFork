const mongoose = require("./mongoose-connection");
const Schema = mongoose.Schema;

//     uuid,
//     ruid,
//     name,
//     dob,
//     address,
//     pnum,
    
const patientDetailsSchema = mongoose.Schema({ 

  uuid: {
    type: String,
    required: true,
    trim: true
  },

  ruid: {
    type: String,
    required: true,
    trim: true,
  },

  name: {
    type: String,
    require: true,
    trim: true,
  },

  dob: {
    type: String,
    required: true,
    trim: true,
  },

  address: {
    type: String,
    required: true,
    trim: true,
  },

  pnum: {
    type: String,
    required: true,
    trim: true,
  },

  gender:{
    type: String, 
    required: true,
    trim: true
  }
});

const PatientDetails = mongoose.model('PatientDetails',patientDetailsSchema);


module.exports = PatientDetails;
