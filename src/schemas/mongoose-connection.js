const mongoose = require("mongoose");

const monogoURL = "mongodb://127.0.0.1:27017/blockchain-ehr";

mongoose.connect( "mongodb://127.0.0.1:27017/blockchain-ehr", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

module.exports= mongoose;