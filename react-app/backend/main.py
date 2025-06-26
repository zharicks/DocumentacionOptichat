
from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.database import usuarios_collection, empresas_collection, configuracion_collection
from bson import ObjectId
from dotenv import load_dotenv
import os
import requests
import pandas as pd
import io
from backend.meta_api import obtener_plantillas
import validators

load_dotenv()

app = FastAPI(strict_slashes=False)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def serialize_doc(doc):
    def convert(value):
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, dict):
            return {k: convert(v) for k, v in value.items()}
        if isinstance(value, list):
            return [convert(v) for v in value]
        return value
    return convert(doc)

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    usuario = data.get("usuario")
    password = data.get("password")

    if not usuario or not password:
        raise HTTPException(status_code=400, detail="Usuario y contraseña requeridos")

    user = usuarios_collection.find_one({"usuario": usuario, "password": password})
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    empresa_id = user.get("empresa_id")
    empresa = empresas_collection.find_one({"_id": ObjectId(empresa_id)})
    configuracion_meta = configuracion_collection.find_one({"empresa_id": ObjectId(empresa_id)})

    if not empresa or not configuracion_meta:
        raise HTTPException(status_code=404, detail="Información de empresa o configuración no encontrada")

    return JSONResponse(content={
        "usuario": serialize_doc(user),
        "empresa": serialize_doc(empresa),
        "configuracion_meta": serialize_doc(configuracion_meta),
    })

@app.get("/plantillas-meta")
async def obtener_plantillas_meta(empresa_id: str):
    try:
        print(f"Received request for /plantillas-meta with empresa_id={empresa_id}")
        if not ObjectId.is_valid(empresa_id):
            raise HTTPException(status_code=400, detail="ID de empresa inválido")

        configuracion_meta = configuracion_collection.find_one({"empresa_id": ObjectId(empresa_id)})
        if not configuracion_meta:
            raise HTTPException(status_code=404, detail="Configuración no encontrada")

        token = configuracion_meta.get("token_acceso")
        url = configuracion_meta.get("url_plantillas")

        if not token or not url:
            raise HTTPException(status_code=500, detail="Datos incompletos para consultar plantillas")

        plantillas = obtener_plantillas(token, url)
        return {"plantillas": plantillas}
    except Exception as e:
        print(f"❌ Error en /plantillas-meta: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enviar-mensajes")
async def enviar_mensajes(
    template_name: str = Form(...),
    language: str = Form(...),
    phone_number_id: str = Form(...),
    token: str = Form(...),
    url_envio: str = Form(...),
    campaign_name: str = Form(...),
    file: UploadFile = File(...),
    image: UploadFile = File(None)
):
    try:
        print(f"Received url_envio: {url_envio}")  # Debugging log
        if not url_envio:
            raise HTTPException(status_code=400, detail="url_envio is required")

        if not validators.url(url_envio):
            raise HTTPException(status_code=400, detail="Invalid url_envio")

        # Leer contenido del archivo Excel
        content = await file.read()
        df = pd.read_excel(io.BytesIO(content))
        if 'Nombre' not in df.columns or 'Celular' not in df.columns:
            raise HTTPException(status_code=400, detail="El archivo debe tener columnas 'Nombre' y 'Celular'")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Procesar imagen si existe
        image_url = None
        if image:
            # Aquí deberías implementar la lógica para subir la imagen a un servidor y obtener la URL
            # Por ahora, se utiliza un enlace temporal para pruebas
            image_url = "https://via.placeholder.com/150"

        for _, row in df.iterrows():
            nombre = row["Nombre"]
            celular = str(row["Celular"]).strip()

            payload = {
                "messaging_product": "whatsapp",
                "to": celular,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": language},
                    "components": []
                }
            }

            if image_url:
                payload["template"]["components"].append({
                    "type": "header",
                    "parameters": [
                        {
                            "type": "image",
                            "image": {
                                "link": image_url
                            }
                        }
                    ]
                })

            payload["template"]["components"].append({
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": nombre
                    }
                ]
            })

            response = requests.post(url_envio, headers=headers, json=payload)
            if response.status_code != 200:
                print(f"❌ Error al enviar a {celular}: {response.text}")

        return {"message": "Mensajes enviados correctamente"}

    except Exception as e:
        print("❌ Error general:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
