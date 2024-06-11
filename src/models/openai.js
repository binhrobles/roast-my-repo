import OpenAI from 'openai';

export const getPrediction = async (content) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  console.log('making request...');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You’re a staff software architect, highly capable of identifying common software and design anti-patterns. Given the following repo, identify if this repo is at risk of using any of the anti-patterns [or not following general software design best practices] [or language or framework-specific idiomatic best practices]. Don’t give general advice, keep it tailored for this codebase',
        },
        {
          role: 'user',
          content,
        },
      ],
    });

    return response;
  } catch (error) {
    throw error
  }
}

export default {
  getPrediction,
}
