import requests

def obtener_plantillas(token_acceso: str, url_plantillas: str):
    headers = {
        "Authorization": f"Bearer {token_acceso}",
        "Content-Type": "application/json"
    }
    response = requests.get(url_plantillas, headers=headers)
    
    if response.status_code == 200:
        return response.json().get("data", [])
    else:
        raise Exception(f"Error consultando plantillas: {response.status_code} - {response.text}")
