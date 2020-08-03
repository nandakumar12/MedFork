import json
import ipfshttpclient
import os
import chalk
from flask import Flask, jsonify, request


CURRENT_FILE = os.path.dirname(__file__)
ENCRYPTED_FILES_PATH = os.path.join(CURRENT_FILE, '../../../encrypted-files')

app = Flask(__name__)

@app.route("/ipfs/addFile")
def addFile():
    uid=request.args.get("uid")
    filename=request.args.get("fileName")
    print("IPFS connection:")
    with ipfshttpclient.connect() as client:
        print("uploading.... to ipfs",end='\n')
        hash = client.add(f"{ENCRYPTED_FILES_PATH}/{filename}")['Hash']
        print("hash of the file : "+hash,end='\n')
    return jsonify({"status":"success","hash":hash})

@app.route("/ipfs/retriveFile")
def retriveFile():
    fileHash=request.args.get("fileHash")
    fileName=request.args.get("fileName")
    print("retriving.... from ipfs",end='\n')
    with ipfshttpclient.connect() as client:
        client.get(fileHash)
        os.rename(fileHash,fileName)
    print("Copied to local storage")
    return jsonify({"status":"success"})


port = 9002
app.run(host='127.0.0.1', port=port)

