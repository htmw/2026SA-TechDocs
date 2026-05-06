// code/src/lib/ai/openai.ts

import OpenAI from "openai";
import { getEnv } from "../env";

// Creates one OpenAI client 
export const openai = new OpenAI({
    apiKey: getEnv().OPENAI_API_KEY,
});