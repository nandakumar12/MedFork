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

  validProof(lastProof, proof) {
    const guess = `${lastProof}${proof}`;
    const guessHash = getSHA256HexString(guess);

    return /^0000/.test(guessHash);
  }

  registerNode(address) {
    const host = parse(address).host;

    this.nodes.add(host);
  }

  validChain(chain) {
    let index = 1;

    while (index < chain.length) {
      const previousBlock = chain[index - 1];
      const block = chain[index];

      if (block.previousHash !== this.hash(previousBlock)) {
        return false;
      }

      if (!this.validProof(previousBlock.proof, block.proof)) {
        return false;
      }

      index++;
    }

    return true;
  }

  resolveConflicts() {
    const fetchPromises = [];

    this.nodes.forEach((host) => {
      fetchPromises.push(
        fetch(`http://${host}/chain`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
          })
          .then((json) => json)
      );
    });

    return Promise.all(fetchPromises).then((chains) => {
      let newChain = null;
      let maxLength = this.chain.length;

      chains.forEach(({ chain }) => {
        if (chain.length > maxLength && this.validChain(chain)) {
          maxLength = chain.length;
          newChain = chain;
        }
      });

      if (newChain) {
        this.chain = newChain;
      }

      return !!newChain;
    });
  }
}

module.exports=Blockchain;
