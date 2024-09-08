import json
import logging
from utils.openai_chat_completion.chat_request import send_openai_request

def summarize_text(text):
    prompt = f"Please summarize the following text:\n\n{text}\n\nSummary:"
    return send_openai_request(prompt)

def generate_chapters(text):
    prompt = f'''Please generate YouTube-like chapters for the following text. 
    Format the output as a JSON string containing a list of dictionaries, each with 'title' and 'summary' keys:
    
    {text}
    
    Chapters:'''

    response = send_openai_request(prompt)

    try:
        # Attempt to parse the response as JSON
        chapters = json.loads(response)
        
        # Validate the structure of the parsed JSON
        if not isinstance(chapters, list):
            raise ValueError("Expected a list of chapters")
        
        for chapter in chapters:
            if not isinstance(chapter, dict) or 'title' not in chapter or 'summary' not in chapter:
                raise ValueError("Invalid chapter structure")
        
        return chapters
    except json.JSONDecodeError as e:
        logging.error(f"Error parsing OpenAI response: {e}")
        raise ValueError("Failed to parse the OpenAI response as JSON")
    except ValueError as e:
        logging.error(f"Invalid chapter structure: {e}")
        raise
    except Exception as e:
        logging.error(f"Unexpected error processing OpenAI response: {e}")
        raise ValueError("An unexpected error occurred while processing the OpenAI response")
