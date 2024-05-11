import OpenAI from "openai";
import express, { Request, Response, Router } from "express";
import dotenv from "dotenv";
import SetupPrompt from "../prompts/setup";
import { ErrorResponse } from "../interfaces/error";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});
const DEFAULTS = {
  model: "gpt-3.5-turbo",
  max_tokens: 4096,
};

const OpenAiRouter = Router();

interface AiRequest {
  prompt: string;
}

interface AiResponse {
  response: string;
}

function validatePrompt(prompt: string): boolean {
  return !!prompt;
}

function handleError(res: Response, message: string, statusCode: number = 400) {
  res.status(statusCode).json({ error: message });
}

async function createChatCompletion(
  userPrompt: string
): Promise<string | null> {
  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: [
      { role: "system", content: SetupPrompt },
      { role: "user", content: userPrompt },
    ],
    model: DEFAULTS.model,
    max_tokens: DEFAULTS.max_tokens,
  };

  try {
    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(params);
    return chatCompletion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return null;
  }
}

OpenAiRouter.post<{}, AiResponse | ErrorResponse, AiRequest, never, never>(
  "/openai",
  async (req, res) => {
    const { prompt: userPrompt }: AiRequest = req.body;

    if (!validatePrompt(userPrompt)) {
      return handleError(res, "Prompt is required");
    }

    const aiResponse = await createChatCompletion(userPrompt);

    if (!aiResponse) {
      return handleError(res, "No response from AI", 500);
    }

    res.json({ response: aiResponse });
  }
);

export default OpenAiRouter;
