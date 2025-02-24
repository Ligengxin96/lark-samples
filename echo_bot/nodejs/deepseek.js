import { OpenAI } from "openai";
import dotenv from 'dotenv';
import { redisClient } from './redis.js';
dotenv.config();

const client = new OpenAI({
  baseURL: 'https://api.lkeap.cloud.tencent.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const chat = async (content, chatId) => {
  try {
    const redisKey = `chat_history:${chatId}`;
    const history = await redisClient.get(redisKey);
    let messages = history ? JSON.parse(history) : [];
    messages.push({
      "role": "user",
      "content": content
    });
    messages = messages.slice(-10);
    const completion = await client.chat.completions.create({
      model: "deepseek-r1",
      messages,
    });
    console.log(`Deepseek response: ${JSON.stringify(completion)}`);
    let result = completion.choices[0].message.content;
    if (result.startsWith('\n\n')) {
      result = result.slice(2);
    }
    messages.push({
      "role": "assistant",
      "content": result
    });

    await redisClient.set(redisKey, JSON.stringify(messages), 'EX', 60 * 60 * 24);
    return result;
  } catch (error) {
    console.error(`Deepseek error: ${error}`);
    return `Deepseek error: ${error}`;
  }
}

export { chat };