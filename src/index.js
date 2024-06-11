import 'dotenv/config';
import openai from './models/openai.js';

const main = async () => {
  const response = await openai.getPrediction('oops');
  console.log(response?.choices[0].message.content);
}

main();
