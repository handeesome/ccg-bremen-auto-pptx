import os
import io
import logging
import tempfile
import zipfile
from flask import Flask, render_template, request, jsonify, send_file, after_this_request
from functions.generate_pptx import generate_pptx
from functions.generate_lyrics_pptx import generate_lyrics_pptx
from functions.import_song_slides import extract_song_slides, extract_song_slides_from_path, sanitize_song_name, cleanup_paths, extract_slide_one_audio
import datetime
import requests
from bs4 import BeautifulSoup

# AWS requires the Flask app to be named "application"
application = Flask(__name__)
ENABLE_GOOGLE_DRIVE = False



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

    if ENABLE_GOOGLE_DRIVE:
        logging.info("Google Drive indexing is enabled.")
    else:
        logging.info("Google Drive features are temporarily disabled.")
    
    return render_template('index.html', last_modified=last_modified)

@application.route('/song-import', methods=['GET'])
def song_import():
    return render_template('song_import.html')

@application.route("/get_lyrics", methods=["GET"])
def get_lyrics():
    baseURL = "https://www.zanmei.ai"
    searchURL = baseURL + "/search/song/"
    song_input = request.args.get("song")  # Get songInput from the frontend
    if not song_input:
        logging.error("Lyrics request missing song input.")
        return jsonify({"error": "Missing song input"}), 400

    searchURL = searchURL + song_input
    try:
        response = requests.get(searchURL, timeout=10)  # Fetch page
        response.raise_for_status()  # Raise error if status code is not 200

        soup = BeautifulSoup(response.text, "html.parser")
        songs = soup.select(".mainbody table tr")
        for idx, song in enumerate(songs, 1):
            first_link = song.select_one("a")  # Get the first <a> inside the table
            href = first_link["href"] if first_link else "No link found"
            songURL = baseURL + href
            response = requests.get(songURL, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            lrc_text = soup.find(id="lyric_text")
            if not lrc_text:
                continue
            lrc_text = lrc_text.text
            lrc_link = soup.find(lambda tag: tag.name == "a" and tag.text.strip() == "下载LRC")
            if lrc_link:
                lrc_url = baseURL + lrc_link["href"]  # Get LRC file URL
                print(f"Downloading LRC from: {lrc_url}")

                # Define save path
                save_dir = "static/temp"
                os.makedirs(save_dir, exist_ok=True)  # Ensure directory exists
                save_path = os.path.join(save_dir, "lyrics.lrc")

                # Download LRC file
                response = requests.get(lrc_url, timeout=10)
                if response.status_code == 200:
                    with open(save_path, "wb") as file:
                        file.write(response.content)
                    print(f"LRC file saved to {save_path}")
                    logging.info(f"LRC file saved to {save_path}")
                    return jsonify({"message": "Success", "lrc_text": lrc_text}), 200
                else:
                    print(f"Failed to download LRC file. Status code: {response.status_code}")
                    logging.error(f"Failed to download LRC file. Status code: {response.status_code}")
                    return jsonify({"error": "Failed to download LRC file"}), 500
            else:
                print("下载LRC link not found.")
        return jsonify({"error": "LRC link not found"}), 404
    except requests.exceptions.RequestException as e:
        print(e)
        logging.error(f"RequestException: {e}")
        return jsonify({"error": f"Unable to reach zanmei.ai: {e.__class__.__name__}"}), 502

@application.route('/process-form', methods=['POST'])
def process_form():
    try:
        data = request.json  # Parse JSON
        logging.info(f"Data received: {data}")
        if not data:
            logging.error("No JSON received")
            return jsonify({"error": "No JSON received"}), 400

        fileName = generate_pptx("./docs/template.pptx", data)  # Get saved filename
        return jsonify({"message": "Success", "fileName": fileName}), 200
    except Exception as e:
        logging.error(f"Error in process_form: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400
    
@application.route('/submit-song', methods=['POST'])
def submit_song():
    try:
        data = request.json or {}
        pages = data.get('pages')
        song_name = (data.get('songName') or '').strip()

        if not pages:
            return jsonify({"error": "Missing song pages"}), 400
        if not song_name:
            return jsonify({"error": "Missing song name"}), 400

        fileName = generate_lyrics_pptx('./docs/empty.pptx', pages, song_name)
        return jsonify({"message": "Success", "fileName": fileName}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@application.route('/api/song-import/extract', methods=['POST'])
def extract_song_import():
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    extracted_files = []
    for uploaded_file in files:
        if not uploaded_file or not uploaded_file.filename:
            continue
        try:
            extracted_files.append(extract_song_slides(uploaded_file))
        except Exception as e:
            return jsonify({
                "error": f"Failed to process {uploaded_file.filename}: {str(e)}"
            }), 400

    if not extracted_files:
        return jsonify({"error": "No valid files uploaded"}), 400

    return jsonify({"files": extracted_files}), 200

@application.route('/api/song-import/export', methods=['POST'])
def export_song_import():
    payload = request.json or {}
    files = payload.get('files') or []
    if not files:
        return jsonify({"error": "No extracted slides provided"}), 400

    temp_root = os.path.join(os.getcwd(), 'static', 'temp')
    os.makedirs(temp_root, exist_ok=True)
    output_dir = tempfile.mkdtemp(prefix='song-import-', dir=temp_root)
    generated_paths = []

    try:
        for item in files:
            title = sanitize_song_name(item.get('originalName') or 'song')
            slides = item.get('slides') or []
            slide_texts = [str(slide.get('text', '')).strip() for slide in slides if str(slide.get('text', '')).strip()]

            if not slide_texts:
                continue

            file_name = generate_lyrics_pptx('./docs/empty.pptx', slide_texts, title, output_dir=output_dir)
            generated_paths.append(os.path.join(output_dir, file_name))

        if not generated_paths:
            cleanup_paths([output_dir])
            return jsonify({"error": "No slides with text were available to export"}), 400

        @after_this_request
        def cleanup(response):
            cleanup_paths(generated_paths + [output_dir])
            return response

        if len(generated_paths) == 1:
            output_path = generated_paths[0]
            with open(output_path, 'rb') as f:
                file_data = f.read()
            file_stream = io.BytesIO(file_data)
            file_stream.seek(0)
            return send_file(
                file_stream,
                as_attachment=True,
                download_name=os.path.basename(output_path),
                mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
            for path in generated_paths:
                archive.write(path, arcname=os.path.basename(path))
        zip_buffer.seek(0)

        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name='converted-song-pptx.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        cleanup_paths(generated_paths + [output_dir])
        return jsonify({"error": str(e)}), 500

@application.route('/api/song-import/convert', methods=['POST'])
def convert_song_import():
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    temp_root = os.path.join(os.getcwd(), 'static', 'temp')
    os.makedirs(temp_root, exist_ok=True)
    output_dir = tempfile.mkdtemp(prefix='song-import-', dir=temp_root)
    source_dir = tempfile.mkdtemp(prefix='song-import-src-', dir=temp_root)
    generated_paths = []
    temp_audio_paths = []

    try:
        for uploaded_file in files:
            if not uploaded_file or not uploaded_file.filename:
                continue

            original_name = uploaded_file.filename
            source_path = os.path.join(source_dir, original_name)
            uploaded_file.save(source_path)

            extracted = extract_song_slides_from_path(source_path, original_name)
            slides = extracted.get('slides') or []
            slide_texts = [str(slide.get('text', '')).strip() for slide in slides if str(slide.get('text', '')).strip()]

            if not slide_texts:
                continue

            audio_path = extract_slide_one_audio(source_path, source_dir)
            if audio_path:
                temp_audio_paths.append(audio_path)

            title = sanitize_song_name(original_name or 'song')
            file_name = generate_lyrics_pptx(
                './docs/empty.pptx',
                slide_texts,
                title,
                output_dir=output_dir,
                audio_path=audio_path,
            )
            generated_paths.append(os.path.join(output_dir, file_name))

        if not generated_paths:
            cleanup_paths(temp_audio_paths + [output_dir, source_dir])
            return jsonify({"error": "No slides with text were available to export"}), 400

        @after_this_request
        def cleanup(response):
            cleanup_paths(generated_paths + temp_audio_paths + [output_dir, source_dir])
            return response

        if len(generated_paths) == 1:
            output_path = generated_paths[0]
            with open(output_path, 'rb') as f:
                file_data = f.read()
            file_stream = io.BytesIO(file_data)
            file_stream.seek(0)
            return send_file(
                file_stream,
                as_attachment=True,
                download_name=os.path.basename(output_path),
                mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as archive:
            for path in generated_paths:
                archive.write(path, arcname=os.path.basename(path))
        zip_buffer.seek(0)

        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name='converted-song-pptx.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        cleanup_paths(generated_paths + temp_audio_paths + [output_dir, source_dir])
        return jsonify({"error": str(e)}), 500

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
                    logging.error(f"File not found: {pptx_path}")
            except Exception as e:
                print(f"Error deleting file: {e}")
                logging.error(f"Error deleting file: {e}")
            return response
        
        # Send the in-memory file as a response
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=fileName,
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
    
    except Exception as e:
        logging.error(f"Error in download_pptx: {str(e)}")
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    application.run()
