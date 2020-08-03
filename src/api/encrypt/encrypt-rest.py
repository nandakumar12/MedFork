import os
import base64
import umbral
from umbral import pre, keys, config, signing
from umbral.params import UmbralParameters
import chalk
from umbral.curve import Curve, SECP256K1
import chalk
from flask import Flask, jsonify, request

CURRENT_FILE = os.path.dirname(__file__)
ASSYMETRIC_KEY_PATH = os.path.join(CURRENT_FILE, '../../../asymmetric-keys')
ENCRYPTED_FILES_PATH = os.path.join(CURRENT_FILE, '../../../encrypted-files')


umbral.config.set_default_curve()

app = Flask(__name__)
def check_key_presence(uid):
    print("checking")
    if os.path.isfile(f"{ASSYMETRIC_KEY_PATH}/{uid}_private_key.pem"):
        print(f"{uid} key pair exists and is readable")
        return True
    else:
        return False


@app.route('/genKeyPair')
def gen_keypair():
    uid = request.args.get('uuid')
    if not (check_key_presence(uid)):
        print("Generating key pair")
        private_key = keys.UmbralPrivateKey.gen_key()
        public_key = private_key.get_pubkey()
        print(os.path.abspath(ASSYMETRIC_KEY_PATH))
        with open(f'{ASSYMETRIC_KEY_PATH}/{uid}_private_key.pem', 'wb') as f:
            f.write(private_key.to_bytes())
        with open(f'{ASSYMETRIC_KEY_PATH}/{uid}_public_key.pem', 'wb') as f:
            f.write(public_key.to_bytes())
    response={
		'message':'generated key pair successfully'
	}
    return response,201


def base64encode(data):
    return base64.b64encode(data).decode()


def base64decode(data):
    return base64.b64decode(data.encode())



@app.route("/getpubkey")
def getpubkey():
    uid=request.args.get("uid")
    print(os.path.abspath(ASSYMETRIC_KEY_PATH))
    with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_public_key.pem", "rb") as key_file:
        print(f"{uid}_public_key reading....")
        public_key = key_file.read()
        public_key = keys.UmbralPublicKey.from_bytes(public_key)
        public_key=base64encode(public_key.to_bytes())
    return public_key
    #return {"publicKey":public_key}
    


@app.route("/encrypt")
def encrypt_file():
    uid = request.args.get('uid')
    filename = request.args.get('filename')
    print("Encryption in progress")
    with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_public_key.pem", "rb") as key_file:
        print(f"{uid}_public_key reading....")
        public_key = key_file.read()
        public_key = keys.UmbralPublicKey.from_bytes(public_key)
        # print(public_key)
    with open(f"{ENCRYPTED_FILES_PATH}/{filename}","rb") as f:
        message = f.read()
        # print(message)
        cipherdata, capsule = pre.encrypt(public_key, message)
        # print(cipherdata)
    with open(f"{ENCRYPTED_FILES_PATH}/{filename}_encrypted","wb") as file:
        file.write(cipherdata)
    return base64.b64encode(capsule.to_bytes()).decode()


@app.route("/decrypt")
def decrypt_file():
    uid = request.args.get('uuid')
    filename = request.args.get('filename')
    capsule = request.get_json()['capsule']
    capsule = pre.Capsule.from_bytes(base64.b64decode(capsule.encode()),UmbralParameters(SECP256K1))
    print("decryption in progress")
    with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_private_key.pem", "rb") as key_file:
        private_key = key_file.read()
        private_key = keys.UmbralPrivateKey.from_bytes(private_key)
    with open(f"{ENCRYPTED_FILES_PATH}/{filename}_encrypted", 'rb') as file:
        cipherdata = file.read()
    original_data = pre.decrypt(ciphertext=cipherdata,
                                capsule=capsule,
                                decrypting_key=private_key)
    with open(f"{filename}_orig","wb") as file:
        file.write(original_data)
    return {"decryption":"success"}
    

@app.route("/digital-sign")
def digital_sign(): #uid, text_data=None, filename=None
    uid = request.args.get('uid')
    print(uid)
    filename = request.args.get('filepath')
    text_data = request.args.get("text_data")
    print("Signing the File")
    try:
        with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_private_key.pem", "rb") as key_file:
            print(f"Reading private_key of {uid}")
            private_key = key_file.read()
            private_key = keys.UmbralPrivateKey.from_bytes(private_key)
            print(private_key)
    except:
        return jsonify({'status': False})
    if(filename):
        with open(f"{ENCRYPTED_FILES_PATH}/{filename}", 'rb') as f:
            data = f.read()
    if(text_data):
        data = text_data.encode()
    signature = signing.Signer(private_key)
    print("the sign is ->",base64.b64encode(signature(data)).decode())
    return base64.b64encode(signature(data)).decode()


@app.route("/verify-sign",methods=["POST"])
def sign_verification(): #uid,signature,text_data=None, filename=None
    uid = request.get_json()['uid']
    print('uid ->',uid)
    filename = None#request.get_json()['filepath']
    text_data = request.get_json()['text_data']
    signature = request.get_json()['signature']+"="
    print('signature ->',signature)
    try:
        signature = base64.b64decode(signature.encode())
        with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_public_key.pem", "rb") as key_file:
            public_key = key_file.read()
            public_key = keys.UmbralPublicKey.from_bytes(public_key)
            print(public_key)
    except:
        return jsonify({"status":False})
    if filename:
        with open(f"{ENCRYPTED_FILES_PATH}/{filename}", 'rb') as f:
            data = f.read()
    if text_data:
        data = text_data.encode()
    signature = signing.Signature.from_bytes(signature, True)
    return {"status":signature.verify(data, public_key)}


port = 8085
app.run(host='127.0.0.1', port=port)

'''gen_keypair("nanda5")
cap=encrypt_file("nanda5","super.txt")
decrypt_file("n12071","hello.txt",pre.Capsule.from_bytes(base64.b64decode(cap.encode()),UmbralParameters(SECP256K1)))
sign=digital_sign("100","sih.txt")
print(sign,type(sign))
print(sign_verification("100",base64.b64decode(sign.encode()),"sih.txt"))'''

# print(digital_sign(34,text_data="hello"))
# sign_verification(34,"MEQCIEkNAylUlHQcyI2h9dm7mYBikDNb9U3MjobqHPtxZN9IAiBmPTBBTOYzmBon93SGgnTG6eubC3cOqR9Vqez7hwA1DA==",text_data="hello")