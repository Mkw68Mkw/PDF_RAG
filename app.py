from flask import Flask, request, render_template, session, jsonify
from query_data import query_rag, Conversation
import os
from datetime import timedelta

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_secret_key")
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)

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
        question = request.form['question']
        response = query_rag(question, conv)

        # Speichere Frage & Antwort im Memory (Fix)
        conv.memory.save_context({"input": question}, {"output": response})

        return jsonify({"response": response})  # JSON statt HTML

    return render_template('index.html')

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
