from flask import Flask, request, render_template, session, jsonify
from query_data import query_rag, Conversation
import os
from datetime import timedelta
from flask_cors import CORS
import time  # Importiere das time-Modul

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_secret_key")
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  

# Erlaubt Anfragen von überall und sendet Cookies
CORS(app, resources={r"/*": {"origins": ["https://pdf-rag-olive.vercel.app", "http://localhost:3000"], "supports_credentials": True}})

# Speichert aktive Konversationen
conversation_store = {}

def create_new_conversation():
    """Erstellt eine neue Conversation und speichert sie im globalen Store"""
    conv_id = os.urandom(24).hex()
    conversation_store[conv_id] = Conversation()
    return conv_id

@app.before_request
def before_request():
    """Prüft vor jeder Anfrage, ob eine gültige Conversation existiert"""
    if 'conversation_id' in session:
        conv_id = session['conversation_id']
        if conv_id not in conversation_store:
            session.pop('conversation_id', None)  # Lösche ungültige ID


@app.route('/', methods=['GET', 'POST'])
def index():
    """Haupt-Chat-Seite"""
    if 'conversation_id' not in session:
        print("no conv_id")
        session['conversation_id'] = create_new_conversation()
    
    conv_id = session['conversation_id']
    print(conv_id)
    conv = conversation_store[conv_id]

    if request.method == 'POST':
        data = request.get_json()
        print(data)
        question = data.get("question", "")

        start_time = time.time()  # Zeit vor dem Aufruf erfassen
        response = query_rag(question, conv)
        end_time = time.time()  # Zeit nach dem Aufruf erfassen

        response_time = end_time - start_time  # Berechne die Antwortzeit
        print(f"Response time: {response_time:.2f} seconds")  # Ausgabe der Antwortzeit

        # Speichere Frage & Antwort im Memory
        conv.memory.save_context({"input": question}, {"output": response})
        return jsonify({"response": response})  # JSON statt HTML

    # GET Anfrage: Lade die gesamte Konversation
    conversation_history = [
        {"sender": "User", "message": msg["input"]} for msg in conv.memory.buffer
    ] + [
        {"sender": "Bot", "message": msg["output"]} for msg in conv.memory.buffer
    ]
    
    return jsonify({"history": conversation_history})

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
