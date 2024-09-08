# ai-agents-test

Start prompt

* Write in typescript and nodejs
* implement the service that accepts an audio file
* upload audio to minio bucket
* transcribe it using assemblyai
* using openai summarize all utterances you get from assemblyai to compact the text
* convert the utterances into youtube like chapters: 00:00:00 chapter title
* chapter titles should contain the main point of the utterance
* using openai compact the chapters to highlight the most valuable parts of the conversation
* using ghost admin api create a blog post with the transcription. It should contain the short chapter summary, the full transcription compiled from the utterances and the link to the audio file.