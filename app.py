from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# In-memory storage for text (for simplicity)
stored_texts = []

@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to store text
@app.route('/store_text', methods=['POST'])
def store_text():
    data = request.get_json()
    text = data.get('text', '')
    if text:
        stored_texts.append(text)
        return jsonify({"message": "Text stored successfully", "stored_texts": stored_texts}), 200
    return jsonify({"message": "No text to store"}), 400

# API endpoint to clear all stored text
@app.route('/clear_text', methods=['POST'])
def clear_text():
    global stored_texts
    stored_texts = []
    return jsonify({"message": "All texts cleared"}), 200

# Service worker route to serve the service worker file
@app.route('/static/service-worker.js')
def service_worker():
    return app.send_static_file('service-worker.js')

# Additional route for fetching the stored texts (Optional)
@app.route('/get_texts', methods=['GET'])
def get_texts():
    return jsonify({"stored_texts": stored_texts}), 200

if __name__ == '__main__':
    app.run(debug=True)
