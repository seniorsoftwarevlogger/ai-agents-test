import AudioProcessingService from "./audioProcessingService";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const service = new AudioProcessingService();
  await service.processAudio("/Users/dima/Downloads/test_audio.mp3");
  console.log("Audio processing completed");
}

main().catch(console.error);
