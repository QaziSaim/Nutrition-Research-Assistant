

---

# A Simple Local RAG Tutorial



Welcome to this tutorial, where we’ll guide you through building a local Retrieval-Augmented Generation (RAG) pipeline! This workflow is designed to process documents, create embeddings, and enable search and answer functionalities—all running locally on an NVIDIA GPU. Here’s an overview of what we’ll create:

![Flowchart Description: "This flowchart illustrates a straightforward local Retrieval-Augmented Generation (RAG) workflow for document processing, embedding creation, and query handling. It begins with a collection of documents—such as PDFs or a 1200-page nutrition textbook—which are preprocessed into manageable chunks (e.g., groups of 10 sentences). These chunks serve as context for a Large Language Model (LLM). A curious user might ask, 'What are the macronutrients, and what do they do?' This query is transformed into a numerical representation using an embedding model, such as sentence transformers from Hugging Face, stored efficiently as a `torch.tensor`. For large datasets (e.g., 100k+ embeddings), a vector database or index may be employed. The query and relevant document passages are processed locally on an NVIDIA RTX 4090 GPU. The LLM generates a response based on the retrieved context, which can be accessed via an optional chat web app interface. The entire process leverages local GPU power. The flowchart includes icons for documents, processing steps, and hardware, with arrows guiding the flow from document ingestion to user interaction."](slrw.png)

This pipeline runs entirely on your local NVIDIA GPU, from ingesting PDFs to enabling "chat with PDF" features, using exclusively open-source tools. For our example, we’ll build **NutriChat**, a RAG system that lets you query a 1200-page PDF nutrition textbook and receive LLM-generated answers based on its text.

**PDF Source:** [Human Nutrition Textbook](https://pressbooks.oer.hawaii.edu/humannutrition2/)  
**Notebook:** You can also explore the `00-simple-local-rag.ipynb` notebook directly in [Google Colab](https://colab.research.google.com/github/mrdbourke/simple-local-rag/blob/main/00-simple-local-rag.ipynb).

### TODO List:
- [ ] Finalize setup instructions
- [x] Create header image of workflow
- [ ] Add an introduction to RAG in the README
- [ ] Include extensions in the README
- [x] Record a video walkthrough of the code—completed! Follow along line-by-line on YouTube: [Watch Here](https://youtu.be/qN_2fnOPY-M)

---

## Getting Started

You have two options to begin:
1. **Local NVIDIA GPU**: If you have an NVIDIA GPU with at least 5GB of VRAM, follow the steps below to run this pipeline on your machine.
2. **Google Colab**: If you don’t have a local GPU, you can use Google Colab to run it on a cloud-based NVIDIA GPU.

---

## Prerequisites

To make the most of this tutorial, we recommend:
- Comfort with writing Python code
- Completion of 1–2 beginner courses in machine learning or deep learning
- Familiarity with PyTorch (for a refresher, see  [Beginner PyTorch Video](https://youtu.be/Z_ikDlimN6A?si=NIkrslkvHaNdlYgx))

---

## Setup Instructions

**Note:** These instructions were tested using Python 3.11 on Windows 11 with an NVIDIA RTX 4090 and CUDA 12.1.

### 1. Clone the Repository
```
git clone https://github.com/mrdbourke/simple-local-rag.git
cd simple-local-rag
```

### 2. Create a Virtual Environment
```
python -m venv venv
```

### 3. Activate the Environment
- **Linux/macOS**:  
  ```
  source venv/bin/activate
  ```
- **Windows**:  
  ```
  .\venv\Scripts\activate
  ```

### 4. Install Requirements
```
pip install -r requirements.txt
```

**Important:** I found that `torch` (version 2.1.1+ required for modern attention mechanisms and faster inference) needed manual installation with CUDA support. For Windows, I used:
```
pip3 install -U torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```
Visit [PyTorch’s official guide](https://pytorch.org/get-started/locally/) for more options.

### 5. Launch the Notebook
- **VS Code**:  
  ```
  code .
  ```
- **Jupyter Notebook**:  
  ```
  jupyter notebook
  ```

### Setup Notes
- If you encounter installation issues, please kindly report them by [opening an issue](https://github.com/mrdbourke/simple-local-rag/issues).
- To use the Gemma LLM models, you’ll need to [accept the terms](https://huggingface.co/google/gemma-7b-it) on Hugging Face and authenticate your machine using the [Hugging Face CLI or Hub `login()` function](https://huggingface.co/docs/huggingface_hub/en/quick-start#authentication). For Colab, add a [Hugging Face token](https://huggingface.co/docs/hub/en/security-tokens) to the "Secrets" tab.
- For performance boosts, consider installing Flash Attention 2 (compilation takes 5 minutes to 3 hours depending on your system). See the [Flash Attention 2 GitHub](https://github.com/Dao-AILab/flash-attention/tree/main) for details, or this [Windows-specific thread](https://github.com/Dao-AILab/flash-attention/issues/595). It’s commented out in `requirements.txt` due to compile time—uncomment if you’d like to use it (`pip install flash-attn`).

---

## What is RAG?

Retrieval-Augmented Generation (RAG) is a technique introduced in the paper [*Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*](https://arxiv.org/abs/2005.11401). It combines three key steps:

- **Retrieval**: Finding relevant information from a source based on a query (e.g., pulling pertinent Wikipedia passages for a question).
- **Augmented**: Enhancing an LLM’s input with retrieved information to guide its response.
- **Generation**: Producing a coherent output using the enriched input (e.g., crafting a text response).

---

## Why Use RAG?

RAG enhances LLM performance in two significant ways:
1. **Reducing Hallucinations**: LLMs can sometimes generate plausible but inaccurate outputs. RAG grounds responses in retrieved, factual data, improving accuracy—and if something seems off, you can trace it back to the source.
2. **Custom Data Integration**: Base LLMs are trained on broad internet data, lacking specialized knowledge. RAG lets you incorporate domain-specific resources (e.g., medical texts or company files) for tailored responses.

The original RAG paper’s authors emphasized these benefits:
> "This approach is more grounded in factual knowledge, reducing hallucinations and offering greater control and interpretability. RAG could benefit society in fields like medicine or workplace efficiency."

Additionally, RAG is often faster to implement than fine-tuning an LLM on custom data.

---

## What Problems Can RAG Solve?

RAG shines when an LLM needs access to information beyond its training data (e.g., private or niche datasets). Examples include:
- **Customer Support Chat**: Query your support docs and let an LLM craft answers—think “chatbot for your documentation.” Klarna uses this to [save $40M yearly](https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/).
- **Email Analysis**: Summarize long email threads (e.g., insurance claims) with structured LLM outputs.
- **Internal Documentation Q&A**: Index company info for quick, LLM-powered answers with source references.
- **Textbook Assistance**: Query a textbook (like our NutriChat example) for answers and references during study.

These use cases share a theme: retrieving relevant data and presenting it clearly via an LLM—think of the LLM as a “word calculator.”

---

## Why Run Locally?

Running locally offers:
- **Privacy**: Keep sensitive data off external APIs.
- **Speed**: Avoid API delays—your hardware dictates performance.
- **Cost**: Higher upfront investment, but minimal ongoing expenses.

While LLM APIs may excel in general tasks, local open-source models are increasingly competitive, especially for focused applications.

---

## Key Terms

| Term | Description |
|------|-------------|
| **Token** | A sub-word text unit (e.g., "hello, world!" splits into ["hello", ",", "world", "!"]). Roughly 1 token = 4 characters, 100 tokens = 75 words. Text is tokenized before LLM processing. |
| **Embedding** | A numerical representation of data (e.g., a 768-value vector for a sentence). Similar meanings yield similar embeddings. |
| **Embedding Model** | Converts data into embeddings (e.g., 384 tokens of text into a 768-size vector). Often distinct from the LLM. |
| **Similarity Search** | Finds vectors close in high-dimensional space (e.g., similar text has high cosine similarity or dot product scores). |
| **Large Language Model (LLM)** | A model trained on text patterns, generating continuations (e.g., “hello, world!” might become “we’re building RAG today!”). Output depends on training and prompts. |
| **LLM Context Window** | The token limit for LLM input (e.g., Gemma’s 8,192 tokens = ~24 pages; GPT-4’s 32k = ~96 pages). Larger windows allow more context in RAG. |
| **Prompt** | Input to an LLM, often engineered for ideal outputs via [prompt engineering](https://en.wikipedia.org/wiki/Prompt_engineering), leveraging the LLM’s in-context learning ability. |

---

Thank you for exploring this tutorial! We hope it empowers you to build your own local RAG pipeline with confidence and curiosity. Let’s dive in and create something remarkable together!

--- 
