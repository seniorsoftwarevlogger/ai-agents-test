"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audioProcessingService_1 = __importDefault(require("./audioProcessingService"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function main() {
    const service = new audioProcessingService_1.default();
    await service.processAudio("/Users/dima/Downloads/test_audio.mp3");
    console.log("Audio processing completed");
}
main().catch(console.error);
