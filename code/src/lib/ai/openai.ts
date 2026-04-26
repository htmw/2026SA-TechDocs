// code/src/lib/ai/openai.ts

import OpenAI from "openai";

// Creates one OpenAI client 
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});