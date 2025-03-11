import os
import io
from flask import Flask, render_template, request, jsonify, send_file, after_this_request
from functions.generate_pptx import generate_pptx
from functions.generate_lyrics_pptx import generate_lyrics_pptx
import datetime
from functions.getGDrive import get_gdrive_folder_structure

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
    get_gdrive_folder_structure('serviceAccountKey.json', '13Czs3mdHpL-5XDggphM9n2em4z2ZkSf4', 'static/temp')
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
    
@application.route('/submit-song', methods=['POST'])
def submit_song():
    data = request.json
    fileName = generate_lyrics_pptx('./docs/empty.pptx', data['pages'], data['songName'])
    return jsonify({"message": "Success", "fileName": fileName}), 200

@application.route('/download/<fileName>', methods=['GET'])
def download_pptx(fileName):
    try:
        pptx_path = os.path.join("static/temp", fileName)
        
        # Read the file into memory and close it immediately
        with open(pptx_path, 'rb') as f:
            file_data = f.read()
        
        # Create a BytesIO object from the file data
        file_stream = io.BytesIO(file_data)
        file_stream.seek(0)  # Reset the stream position to the beginning
        
        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(pptx_path):
                    os.remove(pptx_path)
                    print(f"Successfully deleted: {pptx_path}")
                else:
                    print(f"File not found: {pptx_path}")
            except Exception as e:
                print(f"Error deleting file: {e}")
            return response
        
        # Send the in-memory file as a response
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=fileName,
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    application.run()