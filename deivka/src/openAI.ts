import axios from 'axios';

export class OpenAI {
    private static apiUrl = 'https://api.openai.com/v1/engines/davinci/completions';

    public static async summarizeText(text: string): Promise<string> {
        const headers = {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };
        const body = {
            model: 'text-davinci-002',
            prompt: `summarize: ${text}`,
            max_tokens: 1024
        };

        const response = await axios.post(this.apiUrl, body, { headers });
        return response.data.choices[0].text;
    }
}
