import { processAudio } from './audioService';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: npm start <filePath> <bucketName> <objectName>');
    process.exit(1);
  }

  const [filePath, bucketName, objectName] = args;

  try {
    await processAudio(filePath, bucketName, objectName);
    console.log('Audio processing completed successfully.');
  } catch (error) {
    console.error('Error processing audio:', error);
  }
}

main();
