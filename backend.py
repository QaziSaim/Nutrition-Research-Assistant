# backend.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
load_dotenv()

# Simple ChatOpenAI setup
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
embedding_model = HuggingFaceEmbeddings(model="sentence-transformers/all-mpnet-base-v2")
vectorstore = FAISS.load_local(
    "nutrition_index",
    embedding_model,
    allow_dangerous_deserialization=True
)

retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_args = {"k":3}
)


# Prompt Template
system_prompt = """
You are a helpful Nutrition Research Assistant
Answer questions accurately and professionally based on general nutrition knowledge
If you don't know the answer, just say "I don't know"
"{context}"
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])

# Chain
output_parser = StrOutputParser()

question_answer_chain = create_stuff_documents_chain(llm,prompt) | output_parser

chain = create_retrieval_chain(retriever, question_answer_chain) 
def ask_question(query: str):
    response = chain.invoke({"input": query})
    return response['answer']

