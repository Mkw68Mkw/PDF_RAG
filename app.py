from flask import Flask, request, render_template, session, jsonify
from query_data import query_rag, Conversation
import os
from datetime import timedelta
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_secret_key")
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

# Erlaubt Anfragen von überall und sendet Cookies
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

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
        session['conversation_id'] = create_new_conversation()
    
    conv_id = session['conversation_id']
    conv = conversation_store[conv_id]

    if request.method == 'POST':
        #question = request.form['question']
        data = request.get_json()
        print(data)
        question = data.get("question", "")

        response = query_rag(question, conv)

        # Speichere Frage & Antwort im Memory (Fix)
        conv.memory.save_context({"input": question}, {"output": response})

        return jsonify({"response": response})  # JSON statt HTML

    #return render_template('index.html')

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
