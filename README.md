# 📘 AI-LLM Notebook

AI-LLM Notebook is a RAG (Retrieval-Augmented Generation) based chat application.

You can upload your documents and ask any questions, and the AI will give answers based on the content of your files.

1. Clone the Repository

```bash
https://github.com/arjunsaxena122/AI_LLM_Notebook.git
```

2. Install Dependencies
   Navigate to the project folder and run:

```bash
pnpm i
npm i
```
3. Setup Environment Variables
Create a new file named .env in the project root directory.

Inside .env, add your GEMINI API key:

```bash
 GEMINI_API_KEY=your_api_key_here
```

4. Setup Qdrant databases
Run the cmd :

```bash
docker compose up -d
```