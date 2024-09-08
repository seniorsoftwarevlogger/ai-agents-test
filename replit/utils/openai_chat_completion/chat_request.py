
import os

from openai import OpenAI

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)


def send_openai_request(prompt: str) -> str:
    completion = openai_client.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": prompt}], max_tokens=100
    )
    content = completion.choices[0].message.content
    if not content:
        raise ValueError("OpenAI returned an empty response.")
    return content
