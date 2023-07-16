# file: modules/ssl_manager.py

import os
import ssl
import datetime
from dotenv import load_dotenv
from modules.server_logging import server_logging
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import Encoding
from cryptography.hazmat.primitives import hashes  # Add this import


mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("file_upload.log", mode)

class ssl_manager:
    def __init__(self):
        load_dotenv()
        self.uploadRoot = 'app/' + os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'
        self.domain = os.getenv("SERVER_DOMAIN") if os.getenv("SERVER_DOMAIN") else ''
        self.private_key_path = os.getenv("SSL_PRIVATE_KEY_PATH") if os.getenv("SSL_PRIVATE_KEY_PATH") else 'ssl/private_key.pem'
        self.certificate_path = os.getenv("SSL_CERTIFICATE_PATH") if os.getenv("SSL_CERTIFICATE_PATH") else 'ssl/certificate.pem'
        log.info('__init__ ssl_manager')


    def generate_ssl_certificate(self):
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )

        public_key = private_key.public_key()

        subject = x509.Name([
            x509.NameAttribute(x509.oid.NameOID.COMMON_NAME, self.domain)
        ])

        certificate = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            subject
        ).public_key(
            public_key
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=365)
        ).sign(private_key, hashes.SHA256(), default_backend())

        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(self.private_key_path), exist_ok=True)

        # Save private key to a file
        private_key_pem = private_key.private_bytes(
            encoding=Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        with open(self.private_key_path, 'wb') as f:
            f.write(private_key_pem)

        # Save certificate to a file
        certificate_pem = certificate.public_bytes(
            encoding=Encoding.PEM
        )
        with open(self.certificate_path, 'wb') as f:
            f.write(certificate_pem)


    def get_ssl_context(self):
        if not os.path.exists(self.certificate_path) or not os.path.exists(self.private_key_path):
            self.generate_ssl_certificate()

        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(certfile=self.certificate_path, keyfile=self.private_key_path)

        return context
