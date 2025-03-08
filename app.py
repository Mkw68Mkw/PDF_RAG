from flask import Flask, request, render_template
from query_data import query_rag

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        question = request.form['question']
        response = query_rag(question)
        return render_template('index.html', response=response)
    return render_template('index.html')

if __name__ == '__main__':
    #app.run(debug=True)
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)