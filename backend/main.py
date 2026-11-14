import os
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from fastapi.responses import StreamingResponse

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# CORS Enable කිරීම (Frontend එකට කතා කරන්න)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API eka wada karanawa!"}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb") as f:
            f.write(await file.read())
        
        loader = PyPDFLoader(file_location)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)
        
        # අලුත්ම Embedding Model එක
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=os.getenv("GEMINI_API_KEY"))
        vectorstore = Chroma.from_documents(documents=chunks, embedding=embeddings)
        
        global global_vectorstore
        global_vectorstore = vectorstore
        
        os.remove(file_location)
        return {"message": "PDF eka successfulliy load unaa! Dan prashna ahanna puluwan."}
    except Exception as e:
        return {"error": str(e)}

@app.get("/ask")
def ask_question(question: str):
    try:
        if 'global_vectorstore' not in globals():
            return {"error": "Mula idan PDF ekak upload karanna."}
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-3.8-flash", 
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.0 # ඉක්මන් උත්තර සඳහා
        )
        
        system_prompt = "Answer the question based on this context: {context}\n\nAnswer shortly."
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(global_vectorstore.as_retriever(search_kwargs={"k": 1}), question_answer_chain)
        
        # Streaming සඳහා generator function එකක්
        def generate_response():
            for chunk in rag_chain.stream({"input": question}):
                if "answer" in chunk:
                    yield chunk["answer"]

        return StreamingResponse(generate_response(), media_type="text/plain")
        
    except Exception as e:
        return {"error": str(e)}