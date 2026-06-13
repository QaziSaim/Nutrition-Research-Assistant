# backend.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

# Simple ChatOpenAI setup
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# Prompt Template
system_prompt = """
You are a helpful Nutrition Research Assistant.
Answer questions accurately and professionally based on general nutrition knowledge.
If you don't know the answer, just say "I don't know".
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])

# Chain
output_parser = StrOutputParser()
chain = prompt | llm | output_parser

def ask_question(query: str):
    response = chain.invoke({"input": query})
    return response