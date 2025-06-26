import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB")]

usuarios_collection = db["usuarios"]
empresas_collection = db["empresas"]
configuracion_collection = db["configuracionMeta"]
