import { Client } from "minio";
import { AssemblyAI } from "assemblyai";
import { OpenAI } from "openai";
import GhostAdminAPI from "@tryghost/admin-api";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

class AudioProcessingService {
  private minioClient: Client;
  private assemblyAI: AssemblyAI;
  private openai: OpenAI;
  private ghostAdmin: GhostAdminAPI;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: parseInt(process.env.MINIO_PORT!, 10),
      useSSL: true,
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    });

    this.assemblyAI = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    this.ghostAdmin = new GhostAdminAPI({
      url: process.env.GHOST_ADMIN_URL!,
      key: process.env.GHOST_ADMIN_API_KEY!,
      version: "v5.0",
    });
  }

  async processAudio(audioFilePath: string): Promise<void> {
    const bucketName = process.env.MINIO_BUCKET_NAME!;
    const objectName = `audio_${Date.now()}.mp3`;

    // Upload to MinIO
    await this.uploadToMinio(bucketName, objectName, audioFilePath);

    // Transcribe using AssemblyAI
    const transcript = await this.transcribeAudio(audioFilePath);

    // Summarize utterances
    const summary = await this.summarizeUtterances(transcript.utterances);

    // Create chapters
    const chapters = this.createChapters(transcript.utterances);

    // Compact chapters
    const compactedChapters = await this.compactChapters(chapters);

    // Create blog post
    await this.createBlogPost(
      summary,
      transcript.text,
      compactedChapters,
      objectName
    );
  }

  private async uploadToMinio(
    bucketName: string,
    objectName: string,
    filePath: string
  ): Promise<void> {
    const fileBuffer = await fs.readFile(filePath);
    await this.minioClient.putObject(bucketName, objectName, fileBuffer);
  }

  private async transcribeAudio(audioFilePath: string): Promise<any> {
    const transcript = await this.assemblyAI.transcripts.transcribe({
      audio: audioFilePath,
      speaker_labels: true,
    });
    return transcript;
  }

  private async summarizeUtterances(utterances: any[]): Promise<string> {
    const utterancesText = utterances.map((u) => u.text).join(" ");
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes text.",
        },
        {
          role: "user",
          content: `Summarize the following text:\n\n${utterancesText}`,
        },
      ],
      max_tokens: 150,
    });
    return response.choices[0].message.content.trim();
  }

  private createChapters(utterances: any[]): string[] {
    return utterances.map((u) => {
      const time = new Date(u.start * 1000).toISOString().substr(11, 8);
      return `${time} ${u.text}`;
    });
  }

  private async compactChapters(chapters: string[]): Promise<string[]> {
    const chaptersText = chapters.join("\n");
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that compacts and highlights the most valuable parts of text.",
        },
        {
          role: "user",
          content: `Compact the following chapters to highlight the most valuable parts:\n\n${chaptersText}`,
        },
      ],
      max_tokens: 200,
    });
    return response.choices[0].message.content.trim().split("\n");
  }

  private async createBlogPost(
    summary: string,
    fullTranscription: string,
    chapters: string[],
    audioFileName: string
  ): Promise<void> {
    const audioUrl = `${process.env.MINIO_PUBLIC_URL}/${audioFileName}`;
    const html = `
      <h2>Summary</h2>
      <p>${summary}</p>

      <h2>Chapters</h2>
      <ul>
        ${chapters.map((chapter) => `<li>${chapter}</li>`).join("\n")}
      </ul>

      <h2>Full Transcription</h2>
      <p>${fullTranscription}</p>

      <p><a href="${audioUrl}">Listen to the audio</a></p>
    `;

    console.log(html);

    await this.ghostAdmin.posts.add(
      {
        title: "Audio Transcription",
        html: html,
        status: "draft",
      },
      { source: "html" }
    );
  }
}

export default AudioProcessingService;
