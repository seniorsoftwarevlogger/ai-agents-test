# Audio Transcription and Blogging Application

This Node.js application handles the uploading of audio files to a MinIO bucket, transcribes them using AssemblyAI, summarizes the transcription using OpenAI, and publishes the summarized content as a blog post using the Ghost Admin API.

## Setup
1. Install the required Node.js packages:
   ```
   npm install express multer dotenv minio axios
   ```
2. Set up the environment variables in the `.env` file.

## Usage
Run the server with:
   ```
   npm start
   ```
Ensure you have provided the correct environment variables in the `.env` file.