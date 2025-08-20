import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

async function aiResponse(query: string = "", relevantChunks: string = "") {
  if (!query) {
    throw new Error(`user query not found ${query}`);
  }

  if (!relevantChunks) {
    throw new Error(`relevant chunks not found ${relevantChunks}`);
  }

  const client = new OpenAI({
    baseURL: process.env.GEMINI_BASE_URL,
  });

  const systemPrompt = `
    You are an AI assistant who helps resolving user query based on the  context available to you from a PDF,CSV file with the context and Page number.

    Rule:
    - Only answer based on the avaiable context from file only.
    
    Context:
    - ${relevantChunks}
  `;

  const response = await client.chat.completions.create({
    model: "gemini-2.5-pro",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
  });

  return response;
}

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    throw new Error(`user query not found ${query}`);
  }

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-004",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "ai_notebook",
    }
  );

  const vectorRetriver = vectorStore.asRetriever({
    k: 3,
  });

  const relevantChunks = await vectorRetriver.invoke(query);

  if (!relevantChunks) {
    throw new Error(`Relevant chunk are not generated ${relevantChunks}`);
  }

  const response = await aiResponse(query, JSON.stringify(relevantChunks));

  if (!response) {
    throw new Error(`AI didn't generate response ${response}`);
  }

  console.log(`Response is generating ... , ${response}`);

  return NextResponse.json(
    {
      data: response,
      message: "AI generated response",
    },
    { status: 200 }
  );
}
