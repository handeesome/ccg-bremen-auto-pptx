import os
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from functions.generate_pptx import generate_pptx

app = Flask(__name__, static_folder='./static', template_folder='./templates')
CORS(app)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

from flask import send_file

@app.route('/process-form', methods=['POST'])
def process_form():
    try:
        data = request.json  # Parse JSON
        if not data:
            return jsonify({"error": "No JSON received"}), 400

        fileName = generate_pptx("./docs/template.pptx", data)  # Get saved filename
        return jsonify({"message": "Success", "fileName": fileName}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/download/<fileName>', methods=['GET'])
def download_pptx(fileName):
    try:
        pptx_path = os.path.join("docs", fileName)
        return send_file(pptx_path, as_attachment=True, download_name=fileName)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Use Heroku's port
    app.run(host='0.0.0.0', port=port)  # Required for Heroku
