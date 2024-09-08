import axios from 'axios';

export class AssemblyAI {
    private static apiUrl = 'https://api.assemblyai.com/v2/transcript';

    public static async transcribeAudio(audioUrl: string): Promise<string> {
        const headers = {
            authorization: process.env.ASSEMBLYAI_API_KEY,
            'content-type': 'application/json'
        };
        const body = {
            audio_url: audioUrl
        };

        const response = await axios.post(this.apiUrl, body, { headers });
        return response.data.text;
    }
}
