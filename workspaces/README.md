# transcriber

## Instructions

### Setup

1. **Minio**:
   - Install Minio server and client.
   - Configure Minio with your endpoint, access key, and secret key.

2. **AssemblyAI**:
   - Sign up for AssemblyAI and get your API key.

3. **OpenAI**:
   - Sign up for OpenAI and get your API key.

4. **Ghost Admin API**:
   - Set up a Ghost blog and get your Admin API key.

5. **Dotenv**:
   - Install dotenv to load environment variables:
     ```sh
     npm install dotenv
     ```

### Usage

1. Clone the repository:
   ```sh
   git clone https://github.com/nLight/transcriber.git
   cd transcriber
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your configuration:
   ```env
   MINIO_ENDPOINT=your_minio_endpoint
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=your_minio_access_key
   MINIO_SECRET_KEY=your_minio_secret_key
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   OPENAI_API_KEY=your_openai_api_key
   GHOST_ADMIN_API_URL=your_ghost_admin_api_url
   GHOST_ADMIN_API_KEY=your_ghost_admin_api_key
   ```

4. Run the service:
   ```sh
   npm start
   ```

### Example

To process an audio file, use the following command:
```sh
node dist/service.js /path/to/your/audio/file.mp3
```

This will:
- Upload the audio file to a Minio bucket.
- Transcribe the audio file using AssemblyAI.
- Summarize the utterances using OpenAI.
- Convert the utterances into YouTube-like chapters.
- Create a blog post using Ghost Admin API with the transcription, chapter summary, and audio file link.
