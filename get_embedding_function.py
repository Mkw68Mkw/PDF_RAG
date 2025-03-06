from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_community.embeddings.bedrock import BedrockEmbeddings
import os
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

def get_embedding_function():
    return OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=os.environ.get("OPENAI_API_KEY")
        )
    # embeddings = OllamaEmbeddings(model="nomic-embed-text")
    
