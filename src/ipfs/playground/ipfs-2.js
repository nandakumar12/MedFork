const IPFS = require('ipfs')
const { globSource } = IPFS
const fs = require("fs");
const util = require("util");
const BufferList = require("bl/BufferList");
const writeFile = util.promisify(fs.writeFile);

//options specific to globSource
const globSourceOptions = {
  recursive: false
};

//example options to pass to IPFS
const addOptions = {
  pin: true,
  wrapWithDirectory: false,
  timeout: 10000
};

const addFile = async (ipfs, fileName, create, data) => {
  const fileCID = []
  if (create) {
    writeFile(`./json-data/${fileName}`, data).then(async () => {
      console.log("adding file to ipfs...")
      for await (const file of ipfs.addAll(globSource(`./json-data/${fileName}`, globSourceOptions), addOptions)) {
        fileCID.push(file);
      }
      return fileCID[0].cid;
    }).catch((err)=>{
      reject(err);
      console.log("Error during uploading the file to ipfs",err);
    });
  }
  }

const retrive =async (ipfs, cid, fileName) => {
  
  for await (const file of ipfs.get(cid)) {
    console.log(file.path)

    if (!file.content) continue;

    const content = new BufferList()
    for await (const chunk of file.content) {
      content.append(chunk)
    }
    fs.writeFile(fileName, content.toString(), (res) => {
      console.log(res);
    });
  }
}

addFile("nandu2.txt",true, "Nandakumar is very very good boy");
// retrive();

/*
{
  path: 'docs/assets/anchor.js',
  cid: CID('QmVHxRocoWgUChLEvfEyDuuD6qJ4PhdDL2dTLcpUy3dSC2'),
  size: 15347
}
{
  path: 'docs/assets/bass-addons.css',
  hash: CID('QmPiLWKd6yseMWDTgHegb8T7wVS7zWGYgyvfj7dGNt2viQ'),
  size: 232
}
...
*/
