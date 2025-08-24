from dotenv import load_dotenv
load_dotenv()
import os
import io
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PyPDF2 import PdfReader
import docx

# =========================
# Setup
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Global variable to store uploaded content
DOCUMENT_STORE = ""

# =========================
# Helper to extract text
# =========================
async def extract_text(file: UploadFile) -> str:
    # Handle TXT
    if file.filename.endswith(".txt"):
        file.file.seek(0)
        return file.file.read().decode("utf-8")

    # Handle PDF
    elif file.filename.endswith(".pdf"):
        file_bytes = await file.read()
        reader = PdfReader(io.BytesIO(file_bytes))
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        return text

    # Handle DOCX
    elif file.filename.endswith(".docx"):
        file_bytes = await file.read()
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text

    else:
        return "Unsupported file format."

# =========================
# Upload endpoint
# =========================
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global DOCUMENT_STORE
    content = await extract_text(file)
    DOCUMENT_STORE = content
    return {"message": "File uploaded and indexed successfully!"}

# =========================
# Chat endpoint
# =========================
class Query(BaseModel):
    query: str

@app.post("/chat")
async def chat(query: Query):
    global DOCUMENT_STORE
    if not DOCUMENT_STORE:
        return {"response": "No document uploaded yet. Please upload one first."}

    prompt = f"Here is the document:\n{DOCUMENT_STORE}\n\nQuestion: {query.query}\nAnswer strictly based on the document."
    response = model.generate_content(prompt)
    return {"response": response.text}
