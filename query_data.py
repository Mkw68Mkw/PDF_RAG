import argparse
from langchain.vectorstores.chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from get_embedding_function import get_embedding_function
import os
from dotenv import load_dotenv

load_dotenv()
CHROMA_PATH = "chroma"

PROMPT_TEMPLATE = """
Beantworte die Frage auf Deutsch basierend nur auf diesem Kontext:

{context}

---

Frage: {question}

Antworte im folgenden Format:
[Deine Antwort hier. Halte dich streng an den Kontext.]

**Quellen:**
- [Quellen-ID 1] 
- [Quellen-ID 2]
"""


def main():
    # Create CLI.
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text
    query_rag(query_text)


def query_rag(query_text: str):
    # Prepare the DB.
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Search the DB.
    results = db.similarity_search_with_score(query_text, k=5)

    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)
    # print(prompt)

    model = ChatOpenAI(
        #model="gpt-4-turbo",
        model="gpt-4o-mini",
        api_key=os.environ.get("OPENAI_API_KEY")  # Same OpenAI key
    )
    response_text = model.invoke(prompt)

    # Quellen aus Metadaten extrahieren
    sources = [f"Dokument {doc.metadata['id']}" for doc, _score in results if "id" in doc.metadata]
    
    # Formatierte Ausgabe
    formatted_response = (
        f"\n{response_text.content}\n\n"
        f"📚 **Verwendete Quellen:**\n" + "\n".join(sources)
    )
    #print(formatted_response)
    return formatted_response


if __name__ == "__main__":
    main()
