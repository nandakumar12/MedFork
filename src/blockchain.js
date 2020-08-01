const SHA256 = require("crypto-js/sha256");
const parse = require("url-parse");
const fetch = require("node-fetch");

function getSHA256HexString(input) {
  return SHA256(input).toString();
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.currentTransactions = [];
    this.nodes = new Set();
    this.transaction_count = 0;
    this.newBlock(100, "1");
  }

  hash(block) {
    const blockString = JSON.stringify(block, Object.keys(block).sort());
    return getSHA256HexString(blockString);
  }

  newBlock(proof, previousHash) {
    const block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.currentTransactions,
      proof,
      previousHash: previousHash || this.hash(this.lastBlock()),
    };

    this.currentTransactions = [];

    this.chain.push(block);

    return block;
  }

  newTransaction(
    digitalSignDoctor,
    digitalSignPatient,
    publicKeyDoctor,
    publicKeyPatient,
    ipfsFileHash,
    capsule,
    uid
  ) {
    this.currentTransactions.push({
      digitalSignDoctor,
      digitalSignPatient,
      publicKeyDoctor,
      publicKeyPatient,
      time: Date.now(),
      modification: "true",
      ipfsFileHash,
      capsule,
      patient: uid,
    });

    return this.chain.length + 1;
  }

  lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  get chainlength(){
    return this.chain.length;
  }

  proofOfWork(lastProof) {
    let proof = 0;

    while (!this.validProof(lastProof, proof)) {
      proof++;
    }

    return proof;
  }
}

module.exports=Blockchain;
