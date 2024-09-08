from gtts import gTTS

# Sample text for the audio file
text = """
Welcome to our audio transcription and summarization service. 
This is a test audio file to demonstrate the capabilities of our system.
We'll use this file to verify that our service can accurately transcribe speech and generate meaningful summaries.
The service uses state-of-the-art AI models to process audio content and provide valuable insights.
Thank you for using our service, and we hope you find it useful for your audio processing needs.
"""

# Generate the audio file
tts = gTTS(text)
tts.save("test_audio.mp3")

print("Test audio file 'test_audio.mp3' has been generated.")
