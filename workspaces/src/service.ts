import * as path from "path";
import * as Minio from "minio";
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import { GhostAdminAPI } from "@tryghost/admin-api";
import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

// Minio configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

// AssemblyAI configuration
const assemblyAIKey = process.env.ASSEMBLYAI_API_KEY;

// OpenAI configuration
const openAIConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openAIConfig);

// Ghost Admin API configuration
const ghostAdminAPI = new GhostAdminAPI({
  url: process.env.GHOST_ADMIN_API_URL,
  key: process.env.GHOST_ADMIN_API_KEY,
  version: "v3",
});

// PostgreSQL client configuration
const pgClient = new Client({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || "5432", 10),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

pgClient.connect();

// Function to upload audio file to Minio
async function uploadToMinio(
  filePath: string,
  bucketName: string,
  objectName: string
) {
  return new Promise((resolve, reject) => {
    minioClient.fPutObject(bucketName, objectName, filePath, (err, etag) => {
      if (err) {
        return reject(err);
      }
      resolve(etag);
    });
  });
}

// Function to transcribe audio file using AssemblyAI
async function transcribeAudio(fileUrl: string) {
  const response = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    {
      audio_url: fileUrl,
    },
    {
      headers: {
        authorization: assemblyAIKey,
        "content-type": "application/json",
      },
    }
  );

  const transcriptId = response.data.id;

  // Polling for transcription completion
  let transcript;
  while (true) {
    const transcriptResponse = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: {
          authorization: assemblyAIKey,
        },
      }
    );

    transcript = transcriptResponse.data;
    if (transcript.status === "completed") {
      break;
    } else if (transcript.status === "failed") {
      throw new Error("Transcription failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  return transcript;
}

// Function to summarize text using OpenAI
async function summarizeText(text: string) {
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `Summarize the following text:\n\n${text}`,
    max_tokens: 150,
  });

  return response.data.choices[0]?.text?.trim() || "";
}

// Function to convert utterances to YouTube-like chapters
function convertToChapters(utterances: any[]) {
  return utterances.map((utterance) => {
    const startTime = new Date(utterance.start * 1000)
      .toISOString()
      .substr(11, 8);
    return `${startTime} ${utterance.text}`;
  });
}

// Function to create a blog post using Ghost Admin API
async function createBlogPost(title: string, html: string) {
  return ghostAdminAPI.posts.add({
    title,
    html,
  });
}

// Function to save transcription to PostgreSQL database
async function saveTranscriptionToDB(
  transcript: any,
  summary: string,
  fileUrl: string
) {
  const query = `
    INSERT INTO "public"."transcriptions" (
      "createdAt",
      "transcription",
      "audioUrl",
      "summary",
      "utterances",
      "transcriptId"
    ) VALUES (
      NOW(),
      $1,
      $2,
      $3,
      $4,
      $5
    )
  `;
  const values = [
    transcript.text,
    fileUrl,
    summary,
    JSON.stringify(transcript.utterances),
    transcript.id,
  ];

  await pgClient.query(query, values);
}

// Main service function
async function processAudio(filePath: string) {
  const bucketName = "audio-files";
  const objectName = path.basename(filePath);

  // Upload audio file to Minio
  await uploadToMinio(filePath, bucketName, objectName);

  // Get the file URL
  const fileUrl = `https://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;

  // Transcribe audio file using AssemblyAI
  const transcript = await transcribeAudio(fileUrl);

  // Summarize utterances using OpenAI
  const summarizedUtterances = await Promise.all(
    transcript.utterances.map(async (utterance: any) => {
      const summary = await summarizeText(utterance.text);
      return {
        ...utterance,
        summary,
      };
    })
  );

  // Convert utterances to YouTube-like chapters
  const chapters = convertToChapters(summarizedUtterances);

  // Summarize chapters using OpenAI
  const chapterSummary = await summarizeText(chapters.join("\n"));

  // Create a blog post using Ghost Admin API
  const postTitle = "Transcription and Summary";
  const postHtml = `
    <h2>Chapter Summary</h2>
    <p>${chapterSummary}</p>
    <h2>Full Transcription</h2>
    <p>${transcript.text}</p>
    <h2>Audio File</h2>
    <a href="${fileUrl}">Download Audio</a>
  `;
  await createBlogPost(postTitle, postHtml);

  // Save transcription and summary to PostgreSQL database
  await saveTranscriptionToDB(transcript, chapterSummary, fileUrl);
}

export { processAudio };
