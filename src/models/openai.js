import OpenAI from "openai";

export const getPrediction = async (content, options = {}) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { mode } = options;
  console.log(`mode: ${mode} -- reading through your code...`);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You’re a staff software architect, highly capable of identifying common software and design anti-patterns. Given the following repo, identify if this repo is at risk of using any software architecture anti-patterns, not following general software design best practices, or not following language or framework-specific idiomatic best practices. Don’t give general advice, keep it tailored for this codebase.

${mode === 'repair'
              ? 'Implement your suggested changes. Add inline comments stating your changes. Return the changed files in JSON format with the shape: { files: [{ path: "", descriptionOfChanges: "", fileContent: "", }... ] }'
              : 'Use this as an opportunity to mentor; go long with your descriptions of the issues, and speak to the best practice concepts. Inline all code into the response and reference their origin filename and line numbers. Return your response in JSON format with the shape: { issues: [{ issue: "", description: "", originalCode: "", improvedCode: "", suggestions: [""] }... ] }'
            }`,
        },
        {
          role: "user",
          content,
        },
      ],
    });

    return response;
  } catch (error) {
    throw error;
  }
};

const getCost = (response) => {
  const { completion_tokens, prompt_tokens } = response.usage;
  return ((prompt_tokens / 1000) * 0.005 + (completion_tokens / 1000) * 0.015).toFixed(4); // gpt-4o pricing
};

const estimateCost = (content) => {
  const inputTokens = content.length / 4;

  const outputTokens = 1000; // assumed

  const cost = (inputTokens / 1000) * 0.005 + (outputTokens / 1000) * 0.015; // gpt-4o pricing
  return cost.toFixed(4);
};

export default {
  getPrediction,
  estimateCost,
  getCost,
};
