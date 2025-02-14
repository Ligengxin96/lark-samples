import { OpenAI } from "openai";
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});


const chat = async (content) => {
  try {
    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          "role": "user",
          "content": `${content}`
        },
      ]
    });
    console.log(`Deepseek response: ${JSON.stringify(completion)}`);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error(`Deepseek error: ${error}`);
    return `Deepseek error: ${error}`;
  }
}

export { chat };