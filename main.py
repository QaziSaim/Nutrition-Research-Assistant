# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend import ask_question

app = FastAPI(
    title="Nutrition Research Assistant",
    description="Simple ChatOpenAI Backend",
    version="1.0"
)

# CORS - Required for your HTML + JS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str


@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Nutrition Assistant API is running!"
    }


@app.post("/ask", response_model=QueryResponse)
async def ask_nutrition_question(request: QueryRequest):
    try:
        answer = ask_question(request.query)
        return {"answer": answer}
    except Exception as e:
        print(f"Error: {e}")
        return {
            "answer": "Sorry, something went wrong. Please try again."
        }

