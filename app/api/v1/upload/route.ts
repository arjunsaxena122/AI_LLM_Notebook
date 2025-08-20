import { NextRequest, NextResponse } from "next/server";
import { fileURLToPath } from "url";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import path from "path";
import { writeFile } from "fs";

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    throw new Error(`uploaded file not found ${file}`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // const ext = path.extname(String(file));
  // const filename:string[] = file.name.split(".");
  const __dirname = fileURLToPath(import.meta.dirname);
  console.log(__dirname)
  const filePath = path.join("/public/assests", Date.now() + file.name);
  writeFile(filePath, buffer, (err) => {
    if (err) console.log(err);
  });

  console.log("from backend", file);

  return NextResponse.json(
    {
      data: {
        filename: file.name,
        type: file.type,
        size: file.size,
      },
      message: "file is uploaded or not",
    },
    { status: 200 }
  );

  // if (!file) {
  //   throw new Error(`ERROR: file isn't uploaded yet ${file}`);
  // }

  // const loader = new PDFLoader(file);
  // //   const loader = new CSVLoader(exampleCsvPath);

  // const docs = await loader.load();

  // console.log(`Here is a pdf docs : ${docs[0]}`);

  // const embeddings = new GoogleGenerativeAIEmbeddings({
  //   apiKey: process.env.OPENAI_API_KEY,
  //   model: "text-embedding-004",
  // });

  // const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
  //   url: "http://locahost:6333",
  //   collectionName: "ai_notebook",
  // });

  // console.log(`Database is preparing to store docs embedding ${vectorStore}`);

  // return NextResponse.json(
  //   {
  //     data: vectorStore,
  //     message: "vector embedding make successfully",
  //   },
  //   { status: 200 }
  // );
}
