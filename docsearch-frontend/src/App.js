import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMsg(res.data.message);
    } catch (err) {
      console.error(err);
      setUploadMsg("❌ Error uploading file");
    }
  };

  // Handle question submission
  const handleAsk = async () => {
    if (!question) return;

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        query: question,
      });
      setAnswer(res.data.response);
    } catch (err) {
      console.error(err);
      setAnswer("❌ Error querying the backend");
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif", 
      backgroundColor: "#f9f9f9", 
      minHeight: "100vh" 
    }}>
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto", 
        background: "white", 
        padding: "20px", 
        borderRadius: "8px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
      }}>
        
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          📄 Document Search AI
        </h2>

        {/* File Upload */}
        <div style={{ marginBottom: "20px" }}>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            style={{ marginRight: "10px" }}
          />
          <button 
            onClick={handleUpload} 
            style={{ padding: "5px 10px", cursor: "pointer" }}
          >
            Upload
          </button>
          <p style={{ marginTop: "8px", color: "#555" }}>{uploadMsg}</p>
        </div>

        <hr style={{ margin: "20px 0" }} />

        {/* Ask Question */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Ask something about your document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ 
              width: "70%", 
              padding: "8px", 
              marginRight: "10px", 
              borderRadius: "4px", 
              border: "1px solid #ccc" 
            }}
          />
          <button 
            onClick={handleAsk} 
            style={{ padding: "8px 15px", cursor: "pointer" }}
          >
            Ask
          </button>
        </div>

        {/* Answer */}
        {answer && (
          <div style={{ 
            marginTop: "20px", 
            background: "#f1f1f1", 
            padding: "15px", 
            borderRadius: "6px" 
          }}>
            <h3 style={{ marginBottom: "10px" }}>Answer:</h3>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
