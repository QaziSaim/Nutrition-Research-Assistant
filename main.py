# main.py
from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend import ask_question
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates



app = FastAPI(
    title="Nutrition Research Assistant",
    description="Simple ChatOpenAI Backend",
    version="1.0"
)

templates = Jinja2Templates(directory="templates")

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


@app.get("/",response_class=HTMLResponse)
async def root(request:Request):
    return templates.TemplateResponse(
        request,
        "index.html"
    )



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

