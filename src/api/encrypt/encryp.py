import os,base64
import umbral
#import ecdsa
from umbral import pre, keys, config, signing
from umbral.params import UmbralParameters
import chalk
from umbral.curve import Curve, SECP256K1
import chalk
from flask import Flask, jsonify, request


umbral.config.set_default_curve()


app = Flask(__name__)
CURRENT_FILE = os.path.dirname(__file__)
ASSYMETRIC_KEY_PATH = os.path.join(CURRENT_FILE, '../../../asymmetric-keys')
ENCRYPTED_FILES_PATH = os.path.join(CURRENT_FILE, '../../../encrypted-files')

def check_key_presence(uid):
	print("checking")
	if os.path.isfile(f"{ASSYMETRIC_KEY_PATH}/{uid}_private_key.pem"):
		print (f"{uid} key pair exists and is readable")
		return True
	else: return False

def gen_keypair(uid):
	if not (check_key_presence(uid)):
		print("Generating key pair")
		private_key = keys.UmbralPrivateKey.gen_key()
		public_key = private_key.get_pubkey()
		with open(f'{ASSYMETRIC_KEY_PATH}/{uid}_private_key.pem', 'wb') as f:
			f.write(private_key.to_bytes())
		with open(f'{ASSYMETRIC_KEY_PATH}/{uid}_public_key.pem', 'wb') as f:
			f.write(public_key.to_bytes())

def base64encode(data):
	return base64.b64encode(data).decode()

def base64decode(data):
	return base64.b64decode(data.encode())

def encrypt_file(uid,filename):
	print("Encryption in progress")
	with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_public_key.pem", "rb") as key_file:
		print(f"{uid}_public_key reading....")
		public_key = key_file.read()
		public_key = keys.UmbralPublicKey.from_bytes(public_key)
		#print(public_key)
	with open(f"{ENCRYPTED_FILES_PATH}/{filename}", encoding="utf8") as f:
		message=f.read().encode()
		#print(message)
		cipherdata, capsule = pre.encrypt(public_key, message)
		#print(cipherdata)
	with open(f"{ENCRYPTED_FILES_PATH}/{filename}_encrypted",'wb') as file:
		file.write(cipherdata)
	return base64.b64encode(capsule.to_bytes()).decode()

def decrypt_file(uid,filename,capsule):
	print("decryption in progress")
	with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_private_key.pem", "rb") as key_file:
		private_key = key_file.read()
		private_key = keys.UmbralPrivateKey.from_bytes(private_key)
	with open(f"{ENCRYPTED_FILES_PATH}/{filename}_encrypted",'rb') as file:
		cipherdata=file.read()
	original_data=pre.decrypt(ciphertext=cipherdata,
							  capsule=capsule,
							  decrypting_key=private_key)
	#print(original_data)

def digital_sign(iid,filename=None,text_data=None):
	print("Signing the File")
	with open(f"{ASSYMETRIC_KEY_PATH}/{iid}_private_key.pem", "rb") as key_file:
		print(f"Reading private_key of {iid}")
		private_key = key_file.read()
		private_key = keys.UmbralPrivateKey.from_bytes(private_key)
		print(private_key)
	if(filename):
		with open(f"{ENCRYPTED_FILES_PATH}/{filename}",'rb') as f:
			data=f.read()
	if(text_data):
		data=text_data.encode()
	signature=signing.Signer(private_key)
	return base64.b64encode(signature(data)).decode()


def sign_verification(uid,signature,filename=None,text_data=None):
	with open(f"{ASSYMETRIC_KEY_PATH}/{uid}_public_key.pem", "rb") as key_file:
		public_key = key_file.read()
		public_key = keys.UmbralPublicKey.from_bytes(public_key)
		print(public_key)
	if filename:
		with open(f"{ENCRYPTED_FILES_PATH}/{filename}",'rb') as f:
			data=f.read()
	if text_data:
		data=text_data.encode()
	signature=signing.Signature.from_bytes(signature,True)
	return signature.verify(data,public_key)

'''gen_keypair("nanda5")
cap=encrypt_file("nanda5","super.txt")
decrypt_file("n12071","hello.txt",pre.Capsule.from_bytes(base64.b64decode(cap.encode()),UmbralParameters(SECP256K1)))
sign=digital_sign("100","sih.txt")
print(sign,type(sign))
print(sign_verification("100",base64.b64decode(sign.encode()),"sih.txt"))'''
