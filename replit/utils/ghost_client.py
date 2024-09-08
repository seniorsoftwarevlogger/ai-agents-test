import requests
import jwt
import time
from config import GHOST_API_URL, GHOST_ADMIN_API_KEY

def create_blog_post(chapter_summary, transcription, audio_file_path):
    # Create JWT token for authentication
    key_id, secret = GHOST_ADMIN_API_KEY.split(':')
    iat = int(time.time())
    header = {'alg': 'HS256', 'typ': 'JWT', 'kid': key_id}
    payload = {
        'iat': iat,
        'exp': iat + 5 * 60,
        'aud': '/v3/admin/'
    }
    token = jwt.encode(payload, bytes.fromhex(secret), algorithm='HS256', headers=header)

    headers = {
        'Authorization': f'Ghost {token}',
        'Content-Type': 'application/json'
    }

    # Prepare the blog post content
    audio_filename = audio_file_path.split('/')[-1]
    content = f"""
    <h2>Chapter Summary</h2>
    <p>{chapter_summary}</p>
    
    <h2>Full Transcription</h2>
    <p>{transcription}</p>
    
    <h2>Audio File</h2>
    <p><a href="/content/files/{audio_filename}">Listen to the original audio</a></p>
    """

    data = {
        'posts': [{
            'title': 'Audio Transcription and Summary',
            'content': content,
            'status': 'published'
        }]
    }

    response = requests.post(f"{GHOST_API_URL}/ghost/api/v3/admin/posts", json=data, headers=headers)
    
    if response.status_code != 201:
        raise Exception(f"Failed to create blog post: {response.text}")

    return response.json()['posts'][0]['url']
