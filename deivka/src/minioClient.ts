import { Client } from "minio";
import dotenv from "dotenv";

dotenv.config();

export class MinioClient {
  private static client = new Client({
    endPoint: process.env.MINIO_URL,
    useSSL: true,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });

  public static async uploadFile(file: any): Promise<string> {
    const bucketName = "audios";
    await this.client.putObject(bucketName, file.originalname, file.buffer);
    return `${process.env.MINIO_URL}/${bucketName}/${file.originalname}`;
  }
}
