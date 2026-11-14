import React, { useState } from 'react';
import axios from 'axios';
import { FaFilePdf, FaPaperPlane } from 'react-icons/fa';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // PDF එක upload කරන function එක
  const handleFileUpload = async () => {
    if (!file) return alert("Select a PDF file first!");
    
    const formData = new FormData();
    formData.append("file", file);
    setUploadStatus("Uploading...");

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data.error) {
        setUploadStatus("Error: " + response.data.error);
      } else {
        setUploadStatus("Success! You can ask questions now.");
      }
    } catch (error) {
      setUploadStatus("The upload failed. Check if the backend is running.");
    }
  };

  // ප්‍රශ්නය අහන function එක
    const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = { role: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/ask?question=${encodeURIComponent(question)}`);
      
      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      // අලුත් AI message එකක් හදන්න
      setMessages(prev => [...prev, { role: 'ai', text: "" }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // එන වචන ටික පණිවිඩයට එකතු කරන්න
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text += chunk;
            return newMessages;
          });
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "AI ekata connect wenna baa." }]);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>AI PDF Chat App</h1>
      </header>

      <div className="upload-section">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={(e) => setFile(e.target.files[0])} 
          id="file-upload" 
          className="file-input" 
        />
        <label htmlFor="file-upload" className="upload-btn">
          <FaFilePdf /> {file ? file.name : "Select PDF"}
        </label>
        <button onClick={handleFileUpload} className="submit-upload-btn">Upload</button>
        {uploadStatus && <p className="status-msg">{uploadStatus}</p>}
      </div>

      <div className="chat-window">
        <div className="messages">
          {messages.length === 0 && (
            <p className="empty-msg">Please upload your PDF and send the question you would like answered based on it. I will read it and provide you with an answer.</p>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="message ai">Thinking....</div>}
        </div>
        
        <form onSubmit={handleAskQuestion} className="input-area">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question here..."
            disabled={uploadStatus !== "Success! You can ask questions now."}
          />
          <button type="submit" disabled={loading || uploadStatus !== "Success! You can ask questions now."}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;