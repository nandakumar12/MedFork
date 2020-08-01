const IPFS = require('ipfs')
const { globSource } = IPFS

const fs = require("fs");
const util = require("util");
const BufferList = require("bl/BufferList");
const writeFile = util.promisify(fs.writeFile);

const addFile =  async (fileName, create, data) => {
  const ipfs = await IPFS.create()
  return new Promise(async (reslove, reject)=>{
    if (create) {
      writeFile(`./json-data/${fileName}`, data).then(async () => {
        console.log("adding")
        const file = await ipfs.add(globSource(`./json-data/${fileName}`));
        console.log("finished adding",file.cid);
        reslove(file.cid);
      }).catch((err)=>{
        reject(err);
        console.log("Error during uploading the file to ipfs",err);
      });
    }
    const file = await ipfs.add(globSource(fileName));
    return [file.cid, ipfs]

 })
};
 

const retriveFile = async (ipfs, cid, fileName) => {
  const fileData = await ipfs.get(cid);
  console.log("retriving...");
  for await (const file of fileData) {
    console.log(file.path);
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }

    fs.writeFile(fileName, content.toString(), (res) => {
      console.log(res);
    });
  }
};

addFile("nanda.txt",true,"nandakumar").then(res=>{
  console.log("hash of the file",res);

  retriveFile(res[1],res[0],"hgg.txt");
  }).catch((err)=>{
    console.log("error during uplploading the file to ipfs",err);
  });
// module.exports = {
//   addFile,
//   retriveFile,
// };
