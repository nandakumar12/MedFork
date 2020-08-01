const axios = require("axios");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const model = require("./schemas/transaction-model");
const { log } = require("console");


const send = async (uid, duid, blockchain) => {
  console.log(uid);
  const fileName = `${uid}-medical-report.json`;  
  const filePath = `./encrypted-files/${fileName}_encrypted`
  const capsule = axios.get(`http://127.0.0.1:8085/encrypt?uid=${uid}&filename=${fileName}`);
  const ipfsFileHash = axios.get(`http://127.0.0.1:9002/ipfs/addFile?fileName=${fileName}_encrypted`);
  const publicKeyPatient = axios.get(` http://127.0.0.1:8085/getpubkey?uid=${uid}`);
  const publicKeyDoctor = axios.get(` http://127.0.0.1:8085/getpubkey?uid=${duid+"_doc"}`);
  const digitalSignDoctor = axios.get(
    `http://127.0.0.1:8085/digital-sign?uid=${duid+"_doc"}&filepath=${fileName}`
  );
  const digitalSignPatient = axios.get(
    `http://127.0.0.1:8085/digital-sign?uid=${uid}&filepath=${fileName}`
  );
  console.log('data from api recieved');
  Promise.all([
    capsule,
    ipfsFileHash,
    publicKeyPatient,
    publicKeyDoctor,
    digitalSignDoctor,
    digitalSignPatient,
  ]).then((resArr) => {
    console.log("before initiating transaction..")
    blockchain.newTransaction({
      capsule: resArr[0].data,
      ipfsFileHash: resArr[1].data.hash,
      publicKeyPatient: resArr[2].data,
      publicKeyDoctor: resArr[3].data,
      digitalSignDoctor: resArr[4].data,
      digitalSignPatient: resArr[5].data,
    });
    console.log("The ipfs metadata",resArr[1].data)
    console.log("registered new transaction");
    console.log("IPFS file hash",resArr[1].toString());
    model.PatientModel.findOne({ uuid: uid },(err,Patient) => {
      trans = {
        capsule: resArr[0].data,
        ipfsFileHash: resArr[1].toString(),
        publicKeyPatient: resArr[2].data,
        publicKeyDoctor: resArr[3].data,
        digitalSignDoctor: resArr[4].data,
        digitalSignPatient: resArr[5].data,
        time: Date.now(),
        modification: "true",
      };
      if (Patient == null) {
        Patient = new model.PatientModel({
          uuid: uid,
          transactions: [trans],
        });
      } else {
        Patient.transactions.push(trans);
      }
        Patient.save()
          .then(() => {
            console.log("Saved Metadata of the Medical record..");
          })
          .catch((err) => {
            console.log(
              err + "Error while updating Transaction detail of Patient in DB "
            );
          
          });
    });



  }).catch(err=>{
    console.log("Error occured during processing transaction",err);
    console.log(...[
      capsule,
      ipfsFileHash,
      publicKeyPatient,
      publicKeyDoctor,
      digitalSignDoctor,
      digitalSignPatient,
    ]);
  });

  
}

module.exports=send;