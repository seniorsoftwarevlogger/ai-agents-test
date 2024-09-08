import os
from dotenv import load_dotenv

load_dotenv()

# AssemblyAI API Key
ASSEMBLYAI_API_KEY = os.getenv('ASSEMBLYAI_API_KEY')

# OpenAI API Key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Ghost Admin API credentials
GHOST_API_URL = os.getenv('GHOST_API_URL')
GHOST_ADMIN_API_KEY = os.getenv('GHOST_ADMIN_API_KEY')

# Upload folder for audio files
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
