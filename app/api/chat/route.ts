import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // If no OpenAI API key is provided, throw an error
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in environment variables.");
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: `You are a helpful assistant. Check your knowledge base before answering any questions.
Only respond to questions using information from tool calls.
If no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
