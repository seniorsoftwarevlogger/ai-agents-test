import * as dotenv from "dotenv";
import * as Minio from "minio";

dotenv.config();
import { AssemblyAI } from "assemblyai";
import { OpenAI } from "openai";

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT!, 10),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
// Function to upload audio to MinIO
async function uploadAudioToMinio(
  filePath: string,
  bucketName: string,
  objectName: string
): Promise<string> {
  await minioClient.fPutObject(bucketName, objectName, filePath, {});
  return `https://${process.env.MINIO_ENDPOINT!}/${bucketName}/${objectName}`;
}

const assemblyAIClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

async function transcribeAudio(fileUrl: string): Promise<string[]> {
  const transcript = await assemblyAIClient.transcripts.transcribe({
    audio_url: fileUrl,
  });

  // Polling for transcript completion
  while (transcript.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
    transcript = await transcript.get();
  }

  return transcript.utterances.map((utterance: any) => utterance.text);
}

// Function to summarize text using OpenAI
async function summarizeText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that summarizes text.",
      },
      {
        role: "user",
        content: `Summarize the following text: ${text}`,
      },
    ],
    max_tokens: 150,
  });

  return response?.choices[0]?.message?.content?.trim() || "";
}

// Function to create chapters from utterances
function createChapters(utterances: string[]): string[] {
  return utterances.map((utterance, index) => {
    const time = new Date(index * 1000).toISOString().substr(11, 8); // Mock time for example
    return `${time} ${utterance.split(" ").slice(0, 5).join(" ")}`; // First 5 words as chapter title
  });
}

// Function to create a blog post using Ghost Admin API
async function createBlogPost(
  title: string,
  content: string,
  audioUrl: string
): Promise<void> {
  await axios.post(
    process.env.GHOST_ADMIN_API_URL! + "/ghost/api/v3/admin/posts/?source=html",
    {
      posts: [
        {
          title,
          html: `<p>${content}</p><p><a href="${audioUrl}">Listen to the audio</a></p>`,
          status: "draft",
        },
      ],
    },
    {
      headers: {
        Authorization: `Ghost ${process.env.GHOST_ADMIN_API_KEY!}`,
      },
    }
  );
}

// Main service function
async function processAudio(
  filePath: string,
  bucketName: string,
  objectName: string
): Promise<void> {
  const audioUrl = await uploadAudioToMinio(filePath, bucketName, objectName);
  const utterances = await transcribeAudio(audioUrl);
  const fullTranscription = utterances.join(" ");
  const summary = await summarizeText(fullTranscription);
  const chapters = createChapters(utterances);
  const chapterSummary = await summarizeText(chapters.join(" "));

  await createBlogPost(
    "Audio Transcription",
    `${chapterSummary}\n\n${fullTranscription}`,
    audioUrl
  );
}

export { processAudio };
