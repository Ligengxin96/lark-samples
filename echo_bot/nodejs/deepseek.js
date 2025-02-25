import { OpenAI } from "openai";
import dotenv from 'dotenv';
import { redisClient } from './redis.js';
dotenv.config();

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const SYSTEM_MESSAGE = {
  "role": "system",
  "content": "你现在是一位选矿专家,精通选矿工艺,选矿设备,矿石性质,矿石分析,矿石加工等领域,你需要专业的回答我问你的问题。"
};

const chat = async (content, chatId) => {
  try {
    const redisKey = `chat_history:${chatId}`;
    const history = await redisClient.get(redisKey);
    let messages = history ? JSON.parse(history) : [SYSTEM_MESSAGE];
    if (messages.length === 1) {
      messages.push({
        "role": "user",
        "content": content,
      });
    } else {
      messages = messages.filter((msg, index) => {
        if (index === 0) return msg.role === "system";
        if (index === 1) return msg.role === "user";
        return true;
      });
      messages.push({
        "role": "user",
        "content": content
      });
    }
    messages = [SYSTEM_MESSAGE, ...messages.slice(-9)];
    const completion = await client.chat.completions.create({
      model: "deepseek-reasoner",
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
    console.error(`Deepseek error: ${error}.`);
    console.debug(error.stack);
    return Math.round() > 0.5 ? `Deepssek 错误,未回复任何信息` : `抱歉，我无法理解您的问题。`;
  }
}

export { chat };