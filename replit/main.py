import os
import logging
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from utils.assemblyai_client import transcribe_audio
from utils.openai_client import summarize_text, generate_chapters
from utils.ghost_client import create_blog_post
from config import UPLOAD_FOLDER

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Set up basic logging configuration
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'audio' not in request.files:
        logging.error("No file part in the request")
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['audio']
    if file.filename == '':
        logging.error("No selected file")
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        try:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            logging.info(f"File saved successfully: {file_path}")
            
            # Transcribe audio
            transcription = transcribe_audio(file_path)
            logging.info("Audio transcription completed")
            
            # Summarize transcription
            summary = summarize_text(transcription)
            logging.info("Text summarization completed")
            
            # Generate chapters
            chapters = generate_chapters(transcription)
            logging.info("Chapter generation completed")
            
            # Create compact summary of chapters
            chapter_summary = summarize_text(', '.join([f"{c['title']}: {c['summary']}" for c in chapters]))
            logging.info("Chapter summary created")
            
            # Create blog post
            post_url = create_blog_post(chapter_summary, transcription, file_path)
            logging.info(f"Blog post created: {post_url}")
            
            return jsonify({
                'message': 'File processed successfully',
                'transcription': transcription,
                'summary': summary,
                'chapters': chapters,
                'chapter_summary': chapter_summary,
                'post_url': post_url
            }), 200
        except Exception as e:
            logging.error(f"Error processing file: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
