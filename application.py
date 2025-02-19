import os
from flask import Flask, render_template, request, jsonify, send_file
from functions.generate_pptx import generate_pptx
import datetime

# AWS requires the Flask app to be named "application"
application = Flask(__name__)


def get_latest_mod_time(directory):
    """ Get the most recent modification date (YYYY-MM-DD) in the project directory. """
    latest_time = 0
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                mod_time = os.path.getmtime(file_path)
                latest_time = max(latest_time, mod_time)  # Track the latest modification
            except FileNotFoundError:
                continue  # Skip files that were deleted
    return datetime.datetime.fromtimestamp(latest_time).strftime('%Y-%m-%d')  # Only Year-Month-Day

@application.route('/', methods=['GET'])
def index():
    last_modified = get_latest_mod_time(os.getcwd())  # Scan all project files
    return render_template('index.html', last_modified=last_modified)

@application.route('/process-form', methods=['POST'])
def process_form():
    try:
        data = request.json  # Parse JSON
        if not data:
            return jsonify({"error": "No JSON received"}), 400

        fileName = generate_pptx("./docs/template.pptx", data)  # Get saved filename
        return jsonify({"message": "Success", "fileName": fileName}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@application.route('/download/<fileName>', methods=['GET'])
def download_pptx(fileName):
    try:
        pptx_path = os.path.join("docs", fileName)
        return send_file(pptx_path, as_attachment=True, download_name=fileName)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    application.run()  
