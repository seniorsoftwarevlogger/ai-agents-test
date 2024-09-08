import requests
from config import ASSEMBLYAI_API_KEY

def transcribe_audio(file_path):
    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
        "content-type": "application/json"
    }
    
    # Upload the audio file
    with open(file_path, "rb") as f:
        response = requests.post("https://api.assemblyai.com/v2/upload", headers=headers, data=f)
    
    if response.status_code != 200:
        raise Exception("Error uploading file to AssemblyAI")
    
    upload_url = response.json()["upload_url"]
    
    # Request transcription
    json = {
        "audio_url": upload_url,
        "auto_chapters": True
    }
    response = requests.post("https://api.assemblyai.com/v2/transcript", json=json, headers=headers)
    
    if response.status_code != 200:
        raise Exception("Error requesting transcription from AssemblyAI")
    
    transcript_id = response.json()['id']
    
    # Poll for transcription completion
    while True:
        response = requests.get(f"https://api.assemblyai.com/v2/transcript/{transcript_id}", headers=headers)
        if response.json()['status'] == 'completed':
            return response.json()['text']
        elif response.json()['status'] == 'error':
            raise Exception("AssemblyAI transcription failed")
