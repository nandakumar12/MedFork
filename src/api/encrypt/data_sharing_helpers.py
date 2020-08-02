from json_check import json_file_check
import json
import encryp
import ipfshttpclient
import umbral
from umbral import pre, keys, signing
from umbral.curve import Curve, SECP256K1
import encryp
import base64
from umbral.params import UmbralParameters
from flask import Flask, jsonify, request
import os

app = Flask(__name__)
CURRENT_FILE = os.path.dirname(__file__)
ASSYMETRIC_KEY_PATH = os.path.join(CURRENT_FILE, '../../../asymmetric-keys')
ENCRYPTED_FILES_PATH = os.path.join(CURRENT_FILE, '../../../encrypted-files')


def verification(uid,public_key,public_key_digitalsign):#signs on hash of the public key and sends itself for verification
    #return encryp.sign_verification(uid,public_key_digitalsign,text_data=public_key)
    return True

@app.route('/newPolicy',methods=['POST'])
def new_policy():
    print(ASSYMETRIC_KEY_PATH)
    print("inside new_policy")
    print(request.get_json(force=True))
    s_uid=request.get_json()["s_uid"]
    r_uid=request.get_json()["r_uid"]
    data_hash=request.get_json()["data_hash"]
    public_key_digitalsign=request.get_json()["public_key_digitalsign"]
    capsule=request.get_json()["capsule"]
    remove=request.get_json()["remove"]
    with open(f"{ASSYMETRIC_KEY_PATH}/{s_uid}_public_key.pem", "rb") as key_file:
        data_owner = key_file.read()
        data_owner = keys.UmbralPublicKey.from_bytes(data_owner)
    with open(f"{ASSYMETRIC_KEY_PATH}/{r_uid}_doc_public_key.pem", "rb") as key_file:
        reciever = key_file.read()
        reciever = keys.UmbralPublicKey.from_bytes(reciever)
    status=verification(s_uid,public_key_digitalsign,data_owner)
    if status:
        if not json_file_check("data_sharing_policies.json"):
            with open("data_sharing_policies.json",'w') as file:
                dummy={
                       'policies': []
                }
                json.dump(dummy,file)
        with open("data_sharing_policies.json",'r+') as file:
            data=json.load(file)
            print("Modifying ploicies",end='\n')
            if not int(remove):
                new_data={
                          'Sender_UID':s_uid,
                          'Reciever_UID':r_uid,
                          'data_owner':encryp.base64encode(data_owner.to_bytes()),
                          'reciever':encryp.base64encode(reciever.to_bytes()),
                          'shared_data':data_hash,
                          'capsule':capsule
                }
                data['policies'].append(new_data)
            else:
                values=data['policies']
                for i in values:
                    if i['Sender_UID']==s_uid and i['Reciever_UID']==r_uid and i['shared_data']==data_hash:
                        values.remove(i)
                        break
                else:
                    return jsonify({'status':"failed"}),200
                    print("The requested policy cannot be found..!")
                data['policies']=values
            file.seek(0)
            json.dump(data,file,indent=4)
            file.truncate()
            return  jsonify({'status':"success"}),201
    else:
        print("Sorry! Verification failed...Retry")
        return jsonify({'status':"failed"}),200

@app.route('/reEncrypt',methods=['POST'])
def re_encrypt():
    print(request.get_json(force=True))
    s_uid = request.get_json(force=True)["s_uid"]
    r_uid = request.get_json(force=True)["r_uid"]
    public_key_digitalsign = request.get_json()["public_key_digitalsign"]
    try:
        with open(f"{ASSYMETRIC_KEY_PATH}/{s_uid}_public_key.pem", "rb") as key_file:
            data_owner = key_file.read()
            data_owner = keys.UmbralPublicKey.from_bytes(data_owner)
        with open(f"{ASSYMETRIC_KEY_PATH}/{r_uid}_doc_public_key.pem", "rb") as key_file:
            reciever = key_file.read()
            reciever = keys.UmbralPublicKey.from_bytes(reciever)
    except:
        return jsonify({"status":"failed","message":"No policy has been written for your UID"})
    status=verification(r_uid,public_key_digitalsign,reciever)
    if status:
        with open("data_sharing_policies.json",'r') as file:
            print("in share")
            data=json.load(file)
            values=data['policies']
            for i in values:
                if i['Sender_UID']==s_uid and i['Reciever_UID']==r_uid:
                    file_hash=i['shared_data']
                    capsule=i['capsule']
                    break
            else:
                return jsonify({"status":"failed","message":"Policy not found !"})
    with ipfshttpclient.connect() as client:
        client.get(file_hash)
    with open(f"{ASSYMETRIC_KEY_PATH}/{s_uid}_private_key.pem", "rb") as key_file:
        sender_private_key = key_file.read()
        sender_private_key = keys.UmbralPrivateKey.from_bytes(sender_private_key)
        signer = signing.Signer(private_key=sender_private_key)
    with open(f"{ASSYMETRIC_KEY_PATH}/{r_uid}_doc_private_key.pem", "rb") as key_file:
        reciever_private_key = key_file.read()
        reciever_private_key = keys.UmbralPrivateKey.from_bytes(reciever_private_key)
    kfrags = pre.generate_kfrags(delegating_privkey=sender_private_key,
                                 signer=signer,
                                 receiving_pubkey=reciever,
                                 threshold=10,
                                 N=20)
    print("The capsule fragments")
    print(*kfrags,sep="\n")
    '''with open(file_hash,'wb') as file:
        file.write(kfrags.to_bytes())
    with open(filename,'rb') as file:
        kfrags=umbral.kfrags.Kfrag.from_bytes(file.read())'''
    cfrags = list()
    new_capsule=pre.Capsule.from_bytes(base64.b64decode(capsule.encode()),UmbralParameters(SECP256K1))
    new_capsule.set_correctness_keys(delegating=data_owner,
                                     receiving=reciever,
                                     verifying=data_owner)
    for kfrag in kfrags:
        cfrag = pre.reencrypt(kfrag=kfrag, capsule=new_capsule)
        cfrags.append(cfrag)
    for cfrag in cfrags:
        new_capsule.attach_cfrag(cfrag)
    with open(file_hash,'rb') as file:
        ciphertext=file.read()
    try:
        response = pre.decrypt(ciphertext=ciphertext, capsule=new_capsule, decrypting_key=reciever_private_key)#.decode()
    except:
        response = "failed"
    if response == "failed":
        return jsonify({"status":"failed","message":"Either the data must be tampered or invalid private key"}),200
    else:
        return jsonify({"status":"success","decryptedMessage":response.decode()})

port = 8099
app.run(host='127.0.0.1', port=port)
'''encryp.gen_keypair("nanda5")
encryp.gen_keypair("nanda10")
cap=encryp.encrypt_file("nanda5","test.txt")
with ipfshttpclient.connect() as client:
    print("uploading.... to ipfs",end='\n')
    hash = client.add("test.txt_encrypted")['Hash']
new_policy("nanda5","nanda10",hash,"pubsign",cap,'0')
re_encrypt("nanda5","nanda10","pubsign")'''
