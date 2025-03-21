import argparse
from langchain.vectorstores.chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from get_embedding_function import get_embedding_function
import os
from dotenv import load_dotenv
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
import time  # Importiere das time-Modul

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

# Neue Conversation-Klasse hinzufügen
class Conversation:
    def __init__(self):
        self.memory = ConversationBufferWindowMemory(k=3)  # Letzte 3 Nachrichten behalten
        self.chain = ConversationChain(
            llm=ChatOpenAI(
                model="gpt-4o-mini",
                api_key=os.environ.get("OPENAI_API_KEY")
            ),
            memory=self.memory
        )
    
    def ask(self, question: str, context: str):
        start_time = time.time()  # Zeit vor dem Aufruf erfassen
        prompt = f"""
        Kontext aus Dokumenten:
        {context}
        
        Gesprächsverlauf:
        {self.memory.load_memory_variables({})['history']}
        
        Neue Frage: {question}
        Antwort (mit [Quellen-ID] Verweisen aus dem Kontext):
        """
        response = self.chain.predict(input=prompt)
        end_time = time.time()  # Zeit nach dem Aufruf erfassen

        response_time = end_time - start_time  # Berechne die Antwortzeit
        print(f"LLM response time: {response_time:.2f} seconds")  # Ausgabe der Antwortzeit

        return response


def main():
    conversation = Conversation()
    # Create CLI.
    #parser = argparse.ArgumentParser()
    #parser.add_argument("query_text", type=str, help="The query text.")
    #args = parser.parse_args()
    #query_text = args.query_text
    
    #query_rag(query_text, conversation=conversation)

    while True:
        user_input = input("You: ")
        print(query_rag(user_input, conversation))


def query_rag(query_text: str, conversation: Conversation):
    # Prepare the DB.
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Search the DB.
    results = db.similarity_search_with_score(query_text, k=5)

    # Conversation erstellen
    
    # Prompt mit Memory erstellen
    context_text = "\n".join([f"[{doc.metadata['id']}] {doc.page_content}" for doc, _ in results])
    response_text = conversation.ask(query_text, context_text)
    
    formatted_response = f"\n{response_text}\n"
    return formatted_response


if __name__ == "__main__":
    main()

#session zur conversation adden