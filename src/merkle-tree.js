const SHA256 = require("crypto-js/sha256");
const parse = require("url-parse");
const fetch = require("node-fetch");
const  axios  = require("axios");

function getSHA256HexString(input) {
  return SHA256(input).toString();
}

class MerkleTrees {
  constructor() {
    this.tree=[]
   
  }

  addTree(uid, duid, tree, root){
      this.tree.push({
          duid,
          uid,
          tree,
          root
      })
  }

  
}

module.exports = MerkleTrees;
