import dotenv from "dotenv";

import express from "express";
import multer from "multer";
import { MinioClient } from "./minioClient";
import { AssemblyAI } from "./assemblyAI";
import { OpenAI } from "./openAI";
import { GhostAdmin } from "./ghostAdmin";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const fileUrl = await MinioClient.uploadFile(req.file);
    res.json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/transcribe", async (req, res) => {
  const fileUrl = req.body.fileUrl;
  try {
    const transcript = await AssemblyAI.transcribeAudio(fileUrl);
    res.json({ transcript });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/summarize", async (req, res) => {
  const transcript = req.body.transcript;
  try {
    const summary = await OpenAI.summarizeText(transcript);
    res.json({ summary });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/publish", async (req, res) => {
  const summary = req.body.summary;
  try {
    const postUrl = await GhostAdmin.publishPost(summary);
    res.json({ postUrl });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
