# 📄 AI PDF Chat App

An intelligent full-stack application that allows you to upload PDF documents and ask questions based on their content. Built with **React**, **FastAPI**, and **Google Gemini AI**.

![App Screenshot]("C:\Users\NGC\OneDrive\Screenshot 2026-11-14 120406.png") *(Replace with actual screenshot later)*

## 🚀 Features
- **PDF Upload:** Upload any PDF document.
- **Intelligent Q&A:** Ask questions and get answers based *only* on the uploaded document (RAG - Retrieval-Augmented Generation).
- **Streaming Responses:** Answers appear word-by-word for a smooth ChatGPT-like experience.
- **Modern UI:** Clean and responsive chat interface built with React.

## 🛠️ Tech Stack
- **Frontend:** React.js, Axios, CSS
- **Backend:** Python, FastAPI, Uvicorn
- **AI/LLM:** Google Gemini API (Gemini 3.8 Flash & Gemini Embeddings)
- **Vector Database:** ChromaDB
- **Framework:** LangChain

## ⚙️ How to Run Locally

### Prerequisites
- Node.js & npm
- Python 3.9+
- Google Gemini API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv (Windows)
.\venv\Scripts\activate
pip install -r requirements.txt