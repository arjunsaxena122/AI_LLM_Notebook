import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import path from "path";
import fs, { writeFileSync } from "fs";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get("file") as unknown as File;
  if (!file) {
    throw new Error(`uploaded file not found ${file}`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(
    process.cwd(),
    "/public/assets",
    Date.now() + file.name
  );

  writeFileSync(filePath, buffer);

  try {
    const loader = new PDFLoader(filePath);
    //    const loader = new CSVLoader(exampleCsvPath);

    const docs = await loader.load();

    // console.log(`Here is a pdf docs :`, docs[0]);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-004",
    });

    // console.log("embeddings ->", embeddings);

    const vectorStore = await QdrantVectorStore.fromDocuments(
      docs,
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "ai_notebook",
      }
    );

    // console.log(`Database is preparing to store docs embedding`, vectorStore);

    fs.unlinkSync(filePath);

    return NextResponse.json(
      {
        data: {
          vectorStore,
          file_data: {
            filename: file.name,
            type: file.type,
            size: file.size,
          },
        },
        message: "vector embedding make successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    fs.unlinkSync(filePath);
    return NextResponse.json(error, { status: 200 });
  }
}
